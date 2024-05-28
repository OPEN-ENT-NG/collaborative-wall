package net.atos.entng.collaborativewall.service.impl;

import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.core.metrics.MetricsOptions;
import net.atos.entng.collaborativewall.controllers.WallWebSocketController;
import net.atos.entng.collaborativewall.service.CollaborativeWallMetricsRecorder;
import net.atos.entng.collaborativewall.service.CollaborativeWallRTService;

public class CollaborativeWallMetricsRecorderFactory {
  private static CollaborativeWallMetricsRecorder collaborativeWallMetricsRecorder;
  private static JsonObject config;
  private static MetricsOptions metricsOptions;
  public static void init(final Vertx vertx, final JsonObject config){
    CollaborativeWallMetricsRecorderFactory.config = config;
    if(config.getJsonObject("metricsOptions") == null) {
      final String metricsOptions = (String) vertx.sharedData().getLocalMap("server").get("metricsOptions");
      if(metricsOptions == null){
        CollaborativeWallMetricsRecorderFactory.metricsOptions = new MetricsOptions().setEnabled(false);
      }else{
        CollaborativeWallMetricsRecorderFactory.metricsOptions = new MetricsOptions(new JsonObject(metricsOptions));
      }
    } else {
      metricsOptions = new MetricsOptions(config.getJsonObject("metricsOptions"));
    }
  }


  /**
   * @return The backend to record metrics. If metricsOptions is defined in the configuration then the backend used
   * is MicroMeter. Otherwise a dummy registrar is returned and it collects nothing.
   */
  public static CollaborativeWallMetricsRecorder getRecorder(final WallWebSocketController controller,
                                                             final CollaborativeWallRTService collaborativeWallRTService) {
    if(collaborativeWallMetricsRecorder == null) {
      if(metricsOptions == null) {
        throw new IllegalStateException("collaborativewall.metricsrecorder.factory.not.set");
      }
      if(metricsOptions.isEnabled()) {
        collaborativeWallMetricsRecorder = new MicrometerCollaborativeWallMetricsRecorder(
            MicrometerCollaborativeWallMetricsRecorder.Configuration.fromJson(config),
            controller::getNumberOfConnectedUsers,
            () -> collaborativeWallRTService.getStatus().ordinal()
        );
        controller.setMetricsRecorder(collaborativeWallMetricsRecorder);
      } else {
        collaborativeWallMetricsRecorder = new CollaborativeWallMetricsRecorder.NoopRecorder();
      }
    }
    return collaborativeWallMetricsRecorder;
  }
}
