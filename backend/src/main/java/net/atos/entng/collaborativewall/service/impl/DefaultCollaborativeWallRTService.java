package net.atos.entng.collaborativewall.service.impl;

import fr.wseduc.webutils.Utils;
import io.vertx.core.*;
import io.vertx.core.eventbus.MessageConsumer;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.redis.client.Redis;
import io.vertx.redis.client.RedisAPI;
import io.vertx.redis.client.RedisOptions;
import io.vertx.redis.client.Response;
import net.atos.entng.collaborativewall.events.*;
import net.atos.entng.collaborativewall.service.CollaborativeWallMetricsRecorder;
import net.atos.entng.collaborativewall.service.CollaborativeWallRTService;
import net.atos.entng.collaborativewall.service.CollaborativeWallService;

import static net.atos.entng.collaborativewall.service.CollaborativeWallService.PatchKind;

import org.apache.commons.lang3.tuple.Pair;
import org.entcore.common.user.UserInfos;

import java.util.*;
import java.util.stream.Collectors;

import static com.google.common.collect.Lists.newArrayList;

public class DefaultCollaborativeWallRTService implements CollaborativeWallRTService {

    private final Vertx vertx;
    private final CollaborativeWallService collaborativeWallService;
    private final JsonObject config;
    private RedisAPI redisSubscriber;
    private RedisAPI redisPublisher;
    private final String serverId;
    private RealTimeStatus realTimeStatus;
    private final CollaborativeMessageFactory messageFactory;
    private static final Logger log = LoggerFactory.getLogger(DefaultCollaborativeWallRTService.class);
    private MessageConsumer<Object> ebConsumer;
    private final long reConnectionDelay;
    private long restartAttempt = 0;
    private final List<Handler<RealTimeStatus>> statusSubscribers;
    private final List<Handler<CollaborativeWallMessageWrapper>> messagesSubscribers;

    private final Map<String, CollaborativeWallUsersMetadata> metadataByWallId;

    private long contextPublisherId = -1;

    private final long publishPeriodInMs;

    private static final String channelName = "__realtime@collaborativewall";

    private static final String metadataCollectionPrefix = "rt_collaborativewall_context_";

    private CollaborativeWallMetricsRecorder metricsRecorder;

    public DefaultCollaborativeWallRTService(Vertx vertx, final JsonObject config,
                                             final CollaborativeWallService collaborativeWallService) {
        this.vertx = vertx;
        this.config = config;
        this.collaborativeWallService = collaborativeWallService;
        this.realTimeStatus = RealTimeStatus.STOPPED;
        this.serverId = UUID.randomUUID().toString();
        this.messageFactory = new CollaborativeMessageFactory(serverId);
        this.statusSubscribers = new ArrayList<>();
        this.messagesSubscribers = new ArrayList<>();
        this.reConnectionDelay = config.getLong("reconnection-delay-in-ms", 1000L);
        this.publishPeriodInMs = config.getLong("publish-context-period-in-ms", 60000L);
        metadataByWallId = new HashMap<>();
    }

    @Override
    public Future<Void> start(CollaborativeWallMetricsRecorder metricsRecorder) {
        this.metricsRecorder = metricsRecorder;
        this.metricsRecorder.onStart();
        Future<Void> future;
        if (RealTimeStatus.STARTED.equals(this.realTimeStatus) || RealTimeStatus.LIMIT.equals(this.realTimeStatus)) {
            future = Future.failedFuture(this.realTimeStatus + ".cannot.be.started");
        } else {
            changeRealTimeStatus(RealTimeStatus.STARTING);
            try {
                final RedisOptions redisOptions = getRedisOptions(vertx, config);
                final Redis subscriberClient = Redis.createClient(vertx, redisOptions);
                redisSubscriber = RedisAPI.api(subscriberClient);
                final Redis publisherClient = Redis.createClient(vertx, redisOptions);
                redisPublisher = RedisAPI.api(publisherClient);

                if (this.ebConsumer == null) {
                    this.ebConsumer = vertx.eventBus().consumer("io.vertx.redis." + channelName);
                    this.ebConsumer
                            .handler(m -> this.onNewRedisMessage(((JsonObject) m.body()).getJsonObject("value").getString("message")))
                            .exceptionHandler(e -> log.error("Uncaught exception while listening to Redis", e));
                } else {
                    log.debug("Already listening for collaborative wall redis messages");
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
                future.onSuccess(e -> publishContextLoop());
            } catch (Exception e) {
                future = Future.failedFuture(e);
            }
        }
        return future;
    }
    @Override
    public Future<List<CollaborativeWallMessage>> pushEventToAllUsers(final String wallId,final UserInfos session, final CollaborativeWallUserAction action, final boolean checkConcurency) {
        return pushEvent(wallId, session, action, "", checkConcurency);
    }

    @Override
    public Future<List<CollaborativeWallMessage>> pushEvent(final String wallId,final UserInfos session, final CollaborativeWallUserAction action, final String wsId, final boolean checkConcurency){
        return this.onNewUserAction(action, wallId, wsId, session, checkConcurency)
                .onSuccess(messages -> this.broadcastMessagesToUsers(messages, true, false, null));
    }

    private void broadcastMessagesToUsers(final List<CollaborativeWallMessage> messages,
                                                  final boolean allowInternalMessages,
                                                  final boolean allowExternalMessages,
                                                  final String exceptWsId) {
        for (final Handler<CollaborativeWallMessageWrapper> messagesSubscriber : this.messagesSubscribers) {
            try {
                messagesSubscriber.handle(new CollaborativeWallMessageWrapper(messages, allowInternalMessages, allowExternalMessages, exceptWsId));
            } catch (Exception e) {
                log.error("An error occurred while sending a message to users", e);
            }
        }
    }

    private Future<Void> publishContextLoop() {
        final Promise<Void> promise = Promise.promise();
        if (contextPublisherId >= 0) {
            this.contextPublisherId = vertx.setPeriodic(publishPeriodInMs, e -> {
                publishMetadata().onComplete(promise);
            });
        } else {
            promise.complete();
        }
        return promise.future();
    }

    private Future<Void> publishMetadata() {
        final Promise<Void> promise = Promise.promise();
        log.debug("Publishing contexts to Redis...");
        final String payload = Json.encode(metadataByWallId);
        redisPublisher.set(newArrayList(
                metadataCollectionPrefix + serverId,
                payload,
                "PX",
                String.valueOf(2 * publishPeriodInMs)
        ), onPublishDone -> {
            if (onPublishDone.succeeded()) {
                promise.complete();
            } else {
                log.error("Cannot publish context to Redis");
                changeRealTimeStatus(RealTimeStatus.ERROR);
                promise.fail(onPublishDone.cause());
            }
        });
        return promise.future();
    }

    @Override
    public Future<Void> stop() {
        if (this.contextPublisherId >= 0) {
            vertx.cancelTimer(this.contextPublisherId);
        }
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
            start(metricsRecorder).onComplete(promise);
        });
        return promise.future();
    }

    private Future<Void> changeRealTimeStatus(RealTimeStatus realTimeStatus) {
        final Promise<Void> promise = Promise.promise();
        if (realTimeStatus == this.realTimeStatus) {
            promise.complete();
        } else {
            log.debug("Changing real time status : " + this.realTimeStatus + " -> " + realTimeStatus);
            this.realTimeStatus = realTimeStatus;
            final Future<Void> cleanPromise;
            if (realTimeStatus == RealTimeStatus.ERROR) {
                cleanPromise = closeAndClean();
            } else {
                cleanPromise = Future.succeededFuture();
            }
            cleanPromise.onComplete(e -> {
                for (Handler<RealTimeStatus> statusSubscriber : this.statusSubscribers) {
                    try {
                        statusSubscriber.handle(this.realTimeStatus);
                    } catch (Exception exc) {
                        log.error("Error occurred while calling status change handler", exc);
                    }
                }
                promise.complete();
            });
        }
        return promise.future();
    }

    private Future<Void> closeAndClean() {
        try {
            redisSubscriber.close();
        } catch (Exception e) {
            log.error("Cannot close redis subscriber", e);
        }
        try {
            redisPublisher.close();
        } catch (Exception e) {
            log.error("Cannot close redis publisher", e);
        }
        return Future.succeededFuture();
    }

    private void onNewRedisMessage(final String payload) {
        log.debug("On new redis message " + payload);
        final CollaborativeWallMessage message = Json.decodeValue(payload, CollaborativeWallMessage.class);
        if (serverId.equals(message.getEmittedBy())) {
            log.debug("WebSocketHandler: message skipped because it was emitted by this server");
        } else {
            final List<CollaborativeWallMessage> messages = newArrayList(message);
            this.broadcastMessagesToUsers(messages, false, true, null);
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
    public String getServerId() {
        return serverId;
    }

    @Override
    public void unsubscribeToStatusChanges(final Handler<RealTimeStatus> subscriber) {
        this.statusSubscribers.remove(subscriber);
    }

    @Override
    public Future<List<CollaborativeWallMessage>> onNewConnection(String wallId, UserInfos user, final String wsId) {
        // Create a message for the user new connection
        // Update this server context for the wall
        // Publish the context
        // Get the context of other servers
        // Create a message with the wall context
        final CollaborativeWallMessage newUserMessage = this.messageFactory.connection(wallId, wsId, user.getUserId());
        return CompositeFuture.all(
                        this.collaborativeWallService.getWall(wallId),
                        this.collaborativeWallService.getNotesOfWall(wallId)
                ).flatMap(wall -> {
                    final CollaborativeWallUsersMetadata context = metadataByWallId.computeIfAbsent(wallId, k -> new CollaborativeWallUsersMetadata());
                    context.addConnectedUser(user);
                    publishMetadata();
                    return this.getUsersContext(wallId).map(userContext -> Pair.of(wall, userContext));
                })
                .map(context -> {
                    final JsonObject wall = context.getKey().resultAt(0);
                    final List<JsonObject> notes = context.getKey().resultAt(1);
                    final CollaborativeWallUsersMetadata userContext = context.getRight();
                    return this.messageFactory.metadata(wallId, wsId, user.getUserId(),
                            new CollaborativeWallMetadata(wall, notes, userContext.getEditing(), userContext.getConnectedUsers()));
                })
                .map(contextMessage -> newArrayList(newUserMessage, contextMessage))
                .compose(messages -> publishMessagesOnRedis(messages).map(messages));
    }

    private Future<CollaborativeWallUsersMetadata> getUsersContext(final String wallId) {
        final Promise<CollaborativeWallUsersMetadata> promise = Promise.promise();
        this.redisPublisher.keys(metadataCollectionPrefix + "*", e -> {
            if (e.succeeded()) {
                log.debug("Fetched context ok");
                final List<String> keys = e.result().stream()
                        .map(Response::toString)
                        .filter(key -> !key.endsWith(serverId))
                        .distinct()
                        .collect(Collectors.toList());
                getOtherAppsMetadata(wallId, keys).map(otherAppsMetadataResult -> {
                            final CollaborativeWallUsersMetadata thisAppMetadata = this.metadataByWallId.computeIfAbsent(
                                    wallId,
                                    k -> new CollaborativeWallUsersMetadata());
                            return CollaborativeWallUsersMetadata.merge(thisAppMetadata, otherAppsMetadataResult);
                        })
                        .onComplete(promise);
            } else {
                log.error("Cannot get context keys");
                promise.fail(e.cause());
            }
        });
        return promise.future().onFailure(th -> changeRealTimeStatus(RealTimeStatus.ERROR));
    }

    private Future<CollaborativeWallUsersMetadata> getOtherAppsMetadata(final String wallId, final List<String> keys) {
        final Promise<CollaborativeWallUsersMetadata> promise = Promise.promise();
        if (keys.isEmpty()) {
            promise.complete(new CollaborativeWallUsersMetadata());
        } else {
            this.redisPublisher.mget(keys, entriesResponse -> {
                if (entriesResponse.succeeded()) {
                    final CollaborativeWallUsersMetadata otherAppsContext = entriesResponse.result().stream()
                            .map(entry -> new JsonObject(entry.toString()))
                            .map(entry -> entry.getJsonObject(wallId))
                            .filter(Objects::nonNull)
                            .map(rawContext -> rawContext.mapTo(CollaborativeWallUsersMetadata.class))
                            .reduce(CollaborativeWallUsersMetadata::merge)
                            .orElseGet(CollaborativeWallUsersMetadata::new);
                    final CollaborativeWallUsersMetadata thisAppContext = this.metadataByWallId.computeIfAbsent(
                            wallId,
                            k -> new CollaborativeWallUsersMetadata());
                    promise.complete(CollaborativeWallUsersMetadata.merge(thisAppContext, otherAppsContext));
                } else {
                    log.error("Cannot get context values", entriesResponse.cause());
                    promise.fail(entriesResponse.cause());
                }
            });
        }
        return promise.future();
    }

    @Override
    public Future<List<CollaborativeWallMessage>> onUserDisconnection(String wallId, String userId, String wsId) {
        final CollaborativeWallMessage disconnectedUserMessage = this.messageFactory.disconnection(wallId, wsId, userId);
        final CollaborativeWallUsersMetadata context = this.metadataByWallId.get(wallId);
        if (context != null) {
            context.removeConnectedUser(userId);
            publishMetadata();
        }
        final List<CollaborativeWallMessage> messages = newArrayList(disconnectedUserMessage);
        return publishMessagesOnRedis(messages).map(messages);
    }

    @Override
    public Future<List<CollaborativeWallMessage>> onNewUserAction(final CollaborativeWallUserAction action, String wallId, String wsId, final UserInfos user, final boolean checkConcurency) {
        // Register (if need be) the data in the message
        // Notify other apps via Redis
        // Send back the same messages to be handled internally
        if (action == null) {
            log.warn("Message does not contain a type");
            return Future.failedFuture("wall.action.missing");
        } else {
            try {
                if (action.isValid()) {
                    return executeAction(action, wallId, wsId, user, checkConcurency)
                            .compose(messagesToBroadcast -> publishMessagesOnRedis(messagesToBroadcast).map(messagesToBroadcast));
                } else {
                    return Future.failedFuture("wall.action.invalid");
                }
            } catch (Exception e) {
                return Future.failedFuture(e);
            }
        }
    }

    private Future<List<CollaborativeWallMessage>> executeAction(final CollaborativeWallUserAction action, String wallId, String wsId, final UserInfos user, final boolean checkConcurency) {
        final CollaborativeWallUsersMetadata context = metadataByWallId.computeIfAbsent(wallId, k -> new CollaborativeWallUsersMetadata());
        switch (action.getType()) {
            // a new client has been dis/connected => message already broadcasted in onNewConnection() / onUserDisconnection()
            case connection:
            case disconnection: {
                return Future.succeededFuture(Collections.emptyList());
            }
            case metadata: {
                // client ask for metadata refresh => broadcast metadata to users
                return CompositeFuture.all(
                                this.collaborativeWallService.getWall(wallId),
                                this.collaborativeWallService.getNotesOfWall(wallId)
                        ).flatMap(wall -> {
                            return this.getUsersContext(wallId).map(userContext -> Pair.of(wall, userContext));
                        })
                        .map(pair -> {
                            final JsonObject wall = pair.getKey().resultAt(0);
                            final List<JsonObject> notes = pair.getKey().resultAt(1);
                            final CollaborativeWallUsersMetadata userContext = pair.getRight();
                            return newArrayList(this.messageFactory.metadata(wallId, wsId, user.getUserId(),
                                    new CollaborativeWallMetadata(wall, notes, userContext.getEditing(), userContext.getConnectedUsers())));
                        });
            }
            case ping: {
                // client is sending a ping => broadcast to other users
                return Future.succeededFuture(newArrayList(this.messageFactory.ping(wallId, wsId, user.getUserId())));
            }
            case cursorMove: {
                // client is sending cursor move => broadcast to other users
                return Future.succeededFuture(newArrayList(this.messageFactory.cursorMove(wallId, wsId, user.getUserId(), action.getNoteId(), action.getMove())));
            }
            case noteAdded: {
                // client has added a note => upsert then broadcast to other users
                return this.collaborativeWallService.upsertNote(wallId, action.getNote(), user, checkConcurency)
                        .map(saved -> newArrayList(this.messageFactory.noteAdded(wallId, wsId, user.getUserId(), saved)));
            }
            case noteDeleted: {
                // client has added a note => delete then broadcast to other users
                return this.collaborativeWallService.deleteNote(wallId, action.getNoteId(), user, checkConcurency)
                        .map(deleted -> newArrayList(this.messageFactory.noteDeleted(wallId, wsId, user.getUserId(), action.getNoteId(), deleted)));
            }
            case noteEditionEnded: {
                // remove from editing
                context.getEditing().removeIf(info -> info.getUserId().equals(user.getUserId()));
                // publish meta
                return publishMetadata().map(published -> newArrayList(this.messageFactory.noteEditionEnded(wallId, wsId, user.getUserId(), action.getNoteId())));
            }
            case noteEditionStarted: {
                // add to editing
                context.getEditing().add(new CollaborativeWallEditingInformation(user.getUserId(), action.getNoteId(), System.currentTimeMillis()));
                // client has start editing => broadcast to other users
                return publishMetadata().map(published -> newArrayList(this.messageFactory.noteEditionStarted(wallId, wsId, user.getUserId(), action.getNoteId())));
            }
            case noteImageUpdated: {
                // client has updated the image's note => upsert then broadcast to other users
                return this.collaborativeWallService.patchNote(wallId, PatchKind.Image, action.getNote(), user, checkConcurency)
                        .map(saved -> newArrayList(this.messageFactory.noteImageUpdated(wallId, wsId, user.getUserId(), saved)));
            }
            case noteMoved: {
                // client has moved the note => patch then broadcast to other users
                return this.collaborativeWallService.patchNote(wallId, PatchKind.Position, action.getNote(), user, checkConcurency)
                        .map(saved -> newArrayList(this.messageFactory.noteMoved(wallId, wsId, user.getUserId(), saved)));
            }
            case noteTextUpdated: {
                // client has updated the image's note => upsert then broadcast to other users
                return this.collaborativeWallService.patchNote(wallId, PatchKind.Text, action.getNote(), user, checkConcurency)
                        .map(saved -> newArrayList(this.messageFactory.noteTextUpdated(wallId, wsId, user.getUserId(), saved)));
            }
            case noteSelected: {
                // add to editing
                context.getEditing().add(new CollaborativeWallEditingInformation(user.getUserId(), action.getNoteId(), System.currentTimeMillis()));
                // client has selected note => broadcast to other users
                return publishMetadata().map(published -> newArrayList(this.messageFactory.noteSelected(wallId, wsId, user.getUserId(), action.getNoteId())));
            }
            case noteUnselected: {
                // remove from editing
                context.getEditing().removeIf(info -> info.getUserId().equals(user.getUserId()));
                // client has unselected note => broadcast to other users
                return publishMetadata().map(published -> newArrayList(this.messageFactory.noteUnselected(wallId, wsId, user.getUserId(), action.getNoteId())));
            }
            case wallUpdate: {
                // client has updated the wall => upsert then broadcast to other users
                return this.collaborativeWallService.updateWall(wallId, action.getWall(), user)
                        .map(saved -> newArrayList(this.messageFactory.wallUpdate(wallId, wsId, user.getUserId(), saved)));
            }
            case wallDeleted: {
                // client has deleted the wall => delete then broadcast to other users
                return this.collaborativeWallService.deleteWall(wallId, user)
                        .map(saved -> newArrayList(this.messageFactory.wallDeleted(wallId, wsId, user.getUserId())));
            }
        }
        return Future.succeededFuture(Collections.emptyList());
    }

    /**
     * Publish messages sequentially on Redis for other APPs.
     *
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
     *
     * @param messages Messages to send
     * @param index    index of the first message to be sent
     * @return Completes when <b>ALL</b> the messages (as of the index)have been successfully published
     * but fails as soon as one of them fails
     */
    private Future<Void> publishMessagesOnRedis(final List<CollaborativeWallMessage> messages, final int index) {
        final Promise<Void> promise = Promise.promise();
        if (messages == null || messages.size() <= index) {
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
    public void subscribeToNewMessagesToSend(Handler<CollaborativeWallMessageWrapper> messagesHandler) {
        this.messagesSubscribers.add(messagesHandler);
    }

    @Override
    public RealTimeStatus getStatus() {
        return this.realTimeStatus;
    }

}
