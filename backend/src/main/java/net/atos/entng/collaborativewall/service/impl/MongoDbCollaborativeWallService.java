package net.atos.entng.collaborativewall.service.impl;

import com.google.common.collect.Lists;
import fr.wseduc.webutils.Utils;
import io.vertx.core.*;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.redis.client.Redis;
import io.vertx.redis.client.RedisAPI;
import io.vertx.redis.client.RedisOptions;
import net.atos.entng.collaborativewall.CollaborativeWall;
import net.atos.entng.collaborativewall.events.CollaborativeWallMessage;
import net.atos.entng.collaborativewall.events.RealTimeStatus;
import net.atos.entng.collaborativewall.service.CollaborativeWallService;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static com.google.common.collect.Lists.newArrayList;

public class MongoDbCollaborativeWallService implements CollaborativeWallService {

  private final Vertx vertx;
  private final RedisAPI redisSubscriber;
  private final RedisAPI redisPublisher;
  private final String serverId;
  private RealTimeStatus realTimeStatus;
  private final CollaborativeMessageFactory messageFactory;
  private static final Logger log = LoggerFactory.getLogger(MongoDbCollaborativeWallService.class);
  private MessageConsumer<Object> ebConsumer;
  private final long reConnectionDelay;
  private long restartAttempt = 0;
  private final List<Handler<RealTimeStatus>> statusSubscribers;
  private final List<Handler<List<CollaborativeWallMessage>>> messagesSubscribers;

  public MongoDbCollaborativeWallService(Vertx vertx, final JsonObject config) {
    this.vertx = vertx;
    this.realTimeStatus = RealTimeStatus.STOPPED;
    final RedisOptions redisOptions = getRedisOptions(vertx, config);
    final Redis subscriberClient = Redis.createClient(vertx, redisOptions);
    redisSubscriber = RedisAPI.api(subscriberClient);
    final Redis publisherClient = Redis.createClient(vertx, redisOptions);
    redisPublisher = RedisAPI.api(publisherClient);
    this.serverId = UUID.randomUUID().toString();
    this.messageFactory = new CollaborativeMessageFactory(serverId);
    this.statusSubscribers = new ArrayList<>();
    this.messagesSubscribers = new ArrayList<>();
    this.reConnectionDelay = config.getLong("reconnection-delay-in-ms", 1000L);
  }

  @Override
  public Future<Void> start() {
    Future<Void> future;
    if(RealTimeStatus.STARTED.equals(this.realTimeStatus) || RealTimeStatus.LIMIT.equals(this.realTimeStatus)) {
      future = Future.failedFuture(this.realTimeStatus + ".cannot.be.started");
    } else {
      changeRealTimeStatus(RealTimeStatus.STARTING);
      try {
        if (this.ebConsumer == null) {
          this.ebConsumer = vertx.eventBus().consumer("io.vertx.redis.__realtime@collaborativewall");
          this.ebConsumer
              .handler(m -> this.onNewRedisMessage((String) m.body()))
              .exceptionHandler(e -> log.error("Uncaught exception while listening to Redis", e));
        } else {
          log.debug("Already listening for collaborativewall redis messages");
        }
        final Promise<Void> promise = Promise.promise();
        redisSubscriber.subscribe(newArrayList("__realtime@collaborativewall"), asyncResult -> {
              if (asyncResult.succeeded()) {
                changeRealTimeStatus(RealTimeStatus.STARTED);
                this.restartAttempt = 0;
              } else {
                this.onRedisConnectionStopped(asyncResult.cause());
              }
            }
        );
        future = promise.future();
      } catch (Exception e) {
        future = Future.failedFuture(e);
      }
    }
    return future;
  }

  @Override
  public Future<Void> stop() {
    return changeRealTimeStatus(RealTimeStatus.STOPPED).onComplete(e -> this.statusSubscribers.clear());
  }

  private void onRedisConnectionStopped(final Throwable cause) {
    log.error("Error while subscribing to __realtime@collaborativewall ", cause);
    changeRealTimeStatus(RealTimeStatus.ERROR);
    this.restartAttempt++;
    final long factor = Math.max(0L, restartAttempt - 1);
    vertx.setTimer((long) (reConnectionDelay * Math.pow(2, factor)), e -> {
      restartAttempt++;
      log.info("Trying to reconnect to Redis....");
      start();
    });
  }

  private Future<Void> changeRealTimeStatus(RealTimeStatus realTimeStatus) {
    log.debug("Changing real time status : " + this.realTimeStatus + " -> " + realTimeStatus);
    this.realTimeStatus = realTimeStatus;

    final Promise<Void> promise = Promise.promise();
    for (Handler<RealTimeStatus> statusSubscriber : this.statusSubscribers) {
      try {
        statusSubscriber.handle(this.realTimeStatus);
      } catch (Exception e) {
        log.error("Error occurred while calling status change handler", e);
      }
    }
    return promise.future();
  }

  private void onNewRedisMessage(final String payload) {
    log.debug("On new redis message " + payload);
    final CollaborativeWallMessage message = Json.decodeValue(payload, CollaborativeWallMessage.class);
    if(serverId.equals(message.getEmittedBy())) {
      log.debug("WebSocketHandler: message skipped because it was emitted by this server");
    } else {
      final List<CollaborativeWallMessage> messages = newArrayList(message);
      for (Handler<List<CollaborativeWallMessage>> messagesSubscriber : this.messagesSubscribers) {
        try {
          messagesSubscriber.handle(messages);
        } catch (Exception e) {
          log.error("An error occurred while receiving a message from Redis", e);
        }
      }
    }
  }

  private RedisOptions getRedisOptions(Vertx vertx, JsonObject conf) {
    JsonObject redisConfig = conf.getJsonObject("redisConfig");
    if (redisConfig == null) {
      final String redisConf = (String) vertx.sharedData().getLocalMap("server").get("redisConfig");
      if (redisConf != null) {
        redisConfig = new JsonObject(redisConf);
      }
    }
    String redisConnectionString = redisConfig.getString("connection-string");
    if (Utils.isEmpty(redisConnectionString)) {
      redisConnectionString =
          "redis://" + (redisConfig.containsKey("auth") ? ":" + redisConfig.getString("auth") + "@" : "") +
              redisConfig.getString("host") + ":" + redisConfig.getInteger("port") + "/" +
              redisConfig.getInteger("select", 0);
    }
    return new RedisOptions()
        .setConnectionString(redisConnectionString)
        .setMaxPoolSize(redisConfig.getInteger("pool-size", 32))
        .setMaxWaitingHandlers(redisConfig.getInteger("maxWaitingHandlers", 100))
        .setMaxPoolWaiting(redisConfig.getInteger("maxPoolWaiting", 100));
  }

  @Override
  public void subscribeToStatusChanges(final Handler<RealTimeStatus> subscriber) {
    this.statusSubscribers.add(subscriber);
  }

  @Override
  public void unsubscribeToStatusChanges(final Handler<RealTimeStatus> subscriber) {
    this.statusSubscribers.remove(subscriber);
  }

  @Override
  public Future<List<CollaborativeWallMessage>> onNewConnection(String wallId, String userId) {
    // Create a message for the user new connection
    // Create a message with the wall context
    throw new RuntimeException("onNewConnection.not.implemented");
  }

  @Override
  public Future<List<CollaborativeWallMessage>> onNewUserMessage(String message, String wallId, String wsId, UserInfos session) {
    // Register (if need be) the data in the message
    // Notify other apps via Redis
    // Send back the same messages to be handled internally
    throw new RuntimeException("onNewUserMessage.not.implemented");
  }

  @Override
  public void subscribeToNewMessagesToSend(Handler<List<CollaborativeWallMessage>> messagesHandler) {
    this.messagesSubscribers.add(messagesHandler);
  }

  @Override
  public RealTimeStatus getStatus() {
    return this.realTimeStatus;
  }
}
