package net.atos.entng.collaborativewall.service.impl;

import fr.wseduc.webutils.Utils;
import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.Promise;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.redis.client.Redis;
import io.vertx.redis.client.RedisAPI;
import io.vertx.redis.client.RedisOptions;
import net.atos.entng.collaborativewall.events.CollaborativeWallMessage;
import net.atos.entng.collaborativewall.events.RealTimeStatus;
import net.atos.entng.collaborativewall.service.CollaborativeWallService;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.List;
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

  private static final String channelName = "__realtime@collaborativewall";

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
          this.ebConsumer = vertx.eventBus().consumer("io.vertx.redis." + channelName);
          this.ebConsumer
              .handler(m -> this.onNewRedisMessage(((JsonObject) m.body()).getJsonObject("value").getString("message")))
              .exceptionHandler(e -> log.error("Uncaught exception while listening to Redis", e));
        } else {
          log.debug("Already listening for collaborativewall redis messages");
        }
        final Promise<Void> promise = Promise.promise();
        log.info("Connecting to Redis....");
        redisSubscriber.subscribe(newArrayList(channelName), asyncResult -> {
              if (asyncResult.succeeded()) {
                log.info("Connection to redis established");
                changeRealTimeStatus(RealTimeStatus.STARTED);
                this.restartAttempt = 0;
                promise.complete();
              } else {
                this.onRedisConnectionStopped(asyncResult.cause()).onComplete(promise);
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

  private Future<Void> onRedisConnectionStopped(final Throwable cause) {
    log.error("Error while subscribing to __realtime@collaborativewall ", cause);
    changeRealTimeStatus(RealTimeStatus.ERROR);
    this.restartAttempt++;
    final long factor = Math.max(0L, restartAttempt - 1);
    final Promise<Void> promise = Promise.promise();
    vertx.setTimer((long) (reConnectionDelay * Math.pow(2, factor)), e -> {
      restartAttempt++;
      log.info("Trying to reconnect to Redis....");
      start().onComplete(promise);
    });
    return promise.future();
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
      if (redisConf == null) {
        throw new IllegalStateException("missing.redis.config");
      } else {
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
  public Future<List<CollaborativeWallMessage>> onNewConnection(String wallId, String userId, final String wsId) {
    // Create a message for the user new connection
    // Create a message with the wall context
    final CollaborativeWallMessage newUserMessage = this.messageFactory.connection(wallId, wsId, userId);
    final List<CollaborativeWallMessage> messages = newArrayList(newUserMessage);
    return publishMessagesOnRedis(messages).map(messages);
  }

  @Override
  public Future<List<CollaborativeWallMessage>> onUserDisconnection(String wallId, String userId, String wsId) {
    final CollaborativeWallMessage disconnectedUserMessage = this.messageFactory.disconnection(wallId, wsId, userId);
    final List<CollaborativeWallMessage> messages = newArrayList(disconnectedUserMessage);
    return publishMessagesOnRedis(messages).map(messages);
  }

  @Override
  public Future<List<CollaborativeWallMessage>> onNewUserMessage(String message, String wallId, String wsId, UserInfos session) {
    // Register (if need be) the data in the message
    // Notify other apps via Redis
    // Send back the same messages to be handled internally
    throw new RuntimeException("onNewUserMessage.not.implemented");
  }

  /**
   * Publish messages sequentially on Redis for other APPs.
   * @param messages Messages to send
   * @return Completes when <b>ALL</b> the messages have been successfully published
   * but fails as soon as one of them fails
   */
  private Future<Void> publishMessagesOnRedis(final List<CollaborativeWallMessage> messages) {
    return publishMessagesOnRedis(messages, 0)
        .onSuccess(e -> log.debug(messages.size() + " messages published on redis"));
  }

  /**
   * Publish messages sequentially starting at a specific index.
   * @param messages Messages to send
   * @param index index of the first message to be sent
   * @return Completes when <b>ALL</b> the messages (as of the index)have been successfully published
   * but fails as soon as one of them fails
   */
  private Future<Void> publishMessagesOnRedis(final List<CollaborativeWallMessage> messages, final int index) {
    final Promise<Void> promise = Promise.promise();
    if(messages == null || messages.size() <= index) {
      promise.complete();
    } else {
      final String payload = Json.encode(messages.get(0));
      redisPublisher.publish(channelName, payload, e -> {
        if (e.succeeded()) {
          publishMessagesOnRedis(messages, index + 1).onComplete(promise);
        } else {
          log.error("An error occurred while publishing redis message : " + payload, e.cause());
          promise.fail(e.cause());
        }
      });
    }
    return promise.future();
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
