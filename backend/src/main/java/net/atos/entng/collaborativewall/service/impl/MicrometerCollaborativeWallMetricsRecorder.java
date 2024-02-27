package net.atos.entng.collaborativewall.service.impl;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import io.vertx.micrometer.backends.BackendRegistries;
import net.atos.entng.collaborativewall.service.CollaborativeWallMetricsRecorder;

import java.time.Duration;
import java.util.Collections;
import java.util.List;
import java.util.function.Supplier;
import java.util.stream.Collectors;

public class MicrometerCollaborativeWallMetricsRecorder implements CollaborativeWallMetricsRecorder {
  private final Timer localMessagesLifespan;
  private final Timer externalMessagesLifespan;
  private final Counter errorCounter;
  private final Counter connectionRejectionCounter;
  private final Counter restartCounter;

  public MicrometerCollaborativeWallMetricsRecorder(final Configuration configuration,
                                                    final Supplier<Number> getNumberOfConnectedUsers,
                                                    final Supplier<Number> getCurrentStatus) {
    final MeterRegistry registry = BackendRegistries.getDefaultNow();
    if (registry == null) {
      throw new IllegalStateException("micrometer.registries.empty");
    }
    Gauge.builder("collaborativewall.rt.connectedusers", getNumberOfConnectedUsers)
        .description("Number of open ws connections")
        .register(registry);
    Gauge.builder("collaborativewall.rt.status", getCurrentStatus)
        .description("Currentstatus of the server : 0 stopped, 1 starting, 2 started, 3 limit reached, 4 error")
        .register(registry);
    Timer.Builder timerBuilder = Timer.builder("collaborativewall.rt.messages.internal.time")
        .description("time elapsed between the creation of an internal message and when it was sent to the client");
    if(configuration.sla.isEmpty()) {
      timerBuilder
          .publishPercentileHistogram()
          .maximumExpectedValue(Duration.ofMinutes(1L));
    } else {
      timerBuilder.sla(configuration.sla.toArray(new Duration[0]));
    }
    localMessagesLifespan = timerBuilder.register(registry);
    timerBuilder = Timer.builder("collaborativewall.rt.messages.external.time")
        .description("time elapsed between the creation of an external message and when it was sent to the client");
    if(configuration.sla.isEmpty()) {
      timerBuilder
          .publishPercentileHistogram()
          .maximumExpectedValue(Duration.ofMinutes(1L));
    } else {
      timerBuilder.sla(configuration.sla.toArray(new Duration[0]));
    }
    externalMessagesLifespan = timerBuilder.register(registry);
    errorCounter = Counter.builder("collaborativewall.rt.senderror")
        .description("number of errors while sending messages to client")
        .register(registry);
    connectionRejectionCounter = Counter.builder("collaborativewall.rt.connectionrejection")
        .description("number of connections rejected due to server status")
        .register(registry);
    restartCounter = Counter.builder("collaborativewall.rt.restart")
        .description("number of restarts")
        .register(registry);
  }

  @Override
  public void onLocalBroadcast(long lifespan) {
    localMessagesLifespan.record(Duration.ofMillis(lifespan));
  }

  @Override
  public void onExternalBroadcast(long lifespan) {
    externalMessagesLifespan.record(Duration.ofMillis(lifespan));
  }

  @Override
  public void onSendError() {
    this.errorCounter.increment();
  }

  @Override
  public void onConnectionRejected() {
    this.connectionRejectionCounter.increment();
  }

  @Override
  public void onStart() {
    this.restartCounter.increment();
  }

  public static class Configuration {
    private final List<Duration> sla;

    public Configuration(List<Duration> sla, int maxNumberOfUsers) {
      this.sla = sla;
    }

    /**
     * <p>Creates the configuration of the metrics recorder based on the global configuration file.</p>
     * <p>
     *     It expects that the configuration contains a property <strong>metrics</strong> that contains the
     *     following fields :
     *     <ul>
     *         <li>sla, the desired buckets (in milliseconds) for the time of locks lifespan</li>
     *     </ul>
     * </p>
     * @param conf
     * @return
     */
    public static Configuration fromJson(final JsonObject conf) {
      final List<Duration> sla;
      if(conf == null || !conf.containsKey("metrics")) {
        sla = Collections.emptyList();
      } else {
        final JsonObject metrics = conf.getJsonObject("metrics");
        sla = metrics.getJsonArray("sla", new JsonArray()).stream()
            .mapToInt(slaBucket -> (int)slaBucket)
            .sorted()
            .mapToObj(Duration::ofMillis)
            .collect(Collectors.toList());
      }
      final int maxConnections = conf.getInteger("max-connections", 0);
      return new Configuration(sla, maxConnections);
    }
  }
}
