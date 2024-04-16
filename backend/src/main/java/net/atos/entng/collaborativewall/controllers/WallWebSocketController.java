package net.atos.entng.collaborativewall.controllers;

import fr.wseduc.webutils.Server;
import fr.wseduc.webutils.request.CookieHelper;
import fr.wseduc.webutils.request.filter.UserAuthFilter;
import io.vertx.core.*;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.Json;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.collaborativewall.events.CollaborativeWallMessage;
import net.atos.entng.collaborativewall.events.CollaborativeWallUserAction;
import net.atos.entng.collaborativewall.events.RealTimeStatus;
import net.atos.entng.collaborativewall.service.CollaborativeWallMetricsRecorder;
import net.atos.entng.collaborativewall.service.CollaborativeWallRTService;
import net.atos.entng.collaborativewall.service.CollaborativeWallService;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.*;
import java.util.stream.Collectors;

import static java.lang.System.currentTimeMillis;

public class WallWebSocketController implements Handler<ServerWebSocket> {
    private final Vertx vertx;
    private static final Logger log = LoggerFactory.getLogger(WallWebSocketController.class);

    private final Map<String, Map<String, ServerWebSocket>> wallIdToWSIdToWS = new HashMap<>();
    private final CollaborativeWallRTService collaborativeWallRTService;
    private final int maxConnections;
    private final CollaborativeWallService collaborativeWallService;
    private CollaborativeWallMetricsRecorder metricsRecorder;

    public WallWebSocketController(final Vertx vertx,
                                   final int maxConnections,
                                   final CollaborativeWallRTService collaborativeWallRTService,
                                   final CollaborativeWallService collaborativeWallService) {
        this.vertx = vertx;
        this.collaborativeWallService = collaborativeWallService;
        this.collaborativeWallRTService = collaborativeWallRTService;
        this.collaborativeWallRTService.subscribeToStatusChanges(newStatus -> {
            if (RealTimeStatus.ERROR.equals(newStatus) || RealTimeStatus.STOPPED.equals(newStatus)) {
                this.closeConnections();
            }
        });
        this.collaborativeWallRTService.subscribeToNewMessagesToSend(messages -> {
            if (messages.isNotEmpty()) {
                this.broadcastMessagesToUsers(messages.getMessages(), messages.isAllowInternal(), messages.isAllowExternal(), messages.getExceptWSId());
            }
        });
        this.maxConnections = maxConnections;
        this.metricsRecorder = CollaborativeWallMetricsRecorder.NoopRecorder.instance;
    }

    @Override
    public void handle(ServerWebSocket ws) {
        if (!RealTimeStatus.STARTED.equals(this.collaborativeWallRTService.getStatus())) {
            log.info("This instance is not ready for connections");
            closeWithError("not.ready.yet", (short) 503, ws);
            this.metricsRecorder.onConnectionRejected();
        } else if (maxConnections > 0 && getNbConnections() >= maxConnections) {
            log.info("This instance reached its capacity, it does not accept connections anymore");
            closeWithError("overload", (short) 503, ws);
            this.metricsRecorder.onConnectionRejected();
        } else {
            ws.pause();
            log.info("Handle websocket");
            final String sessionId = CookieHelper.getInstance().getSigned(UserAuthFilter.SESSION_ID, ws);
            final Optional<String> maybeWallId = getWallId(ws.path());
            if (!maybeWallId.isPresent()) {
                closeWithError("missing.wall.id", (short) 400, ws);
                log.error("No wall id provided");
                return;
            }
            final String wallId = maybeWallId.get();
            final String wsId = UUID.randomUUID().toString();
            UserUtils.getSession(Server.getEventBus(vertx), sessionId, infos -> {
                try {
                    if (infos == null) {
                        closeWithError("not.authenticated", (short) 401, ws);
                        return;
                    }
                    final UserInfos session = UserUtils.sessionToUserInfos(infos);
                    this.collaborativeWallService.canAccess(wallId, session).onFailure(e -> {
                        log.error("An error occurred while checking access to wall", e);
                        closeWithError("unknown.error", (short) 500, ws);
                    }).onSuccess(canAccess -> {
                        if (!canAccess) {
                            closeWithError("not.authorized", (short) 403, ws);
                            return;
                        }
                        final String userId = session.getUserId();
                        ws.closeHandler(e -> onCloseWSConnection(wallId, userId, wsId));
                        onConnect(session, wallId, wsId, ws).onSuccess(onSuccess -> {
                            ws.resume();
                            ws.frameHandler(frame -> {
                                try {

                                    if (frame.isBinary()) {
                                        log.warn("Binary is not handled");
                                    } else {
                                        final String message = frame.textData();
                                        final CollaborativeWallUserAction action = Json.decodeValue(message, CollaborativeWallUserAction.class);
                                        this.collaborativeWallRTService.pushEvent(wallId, session, action, wsId, false).onFailure(th -> this.sendError(th, ws));
                                    }
                                } catch (Exception e) {
                                    log.error("An error occured while parsing message:", e);
                                    this.sendError(e, ws);
                                }
                            });
                        }).onFailure(th -> {
                            log.error("An error occurred while opening the websocket", th);
                            closeWithError("unknown.error", (short) 500, ws);
                        });
                    });
                } catch (Exception e) {
                    ws.resume();
                    closeWithError("unknown.error", (short) 500, ws);
                    log.error("An error occurred while treating ws", e);
                }
            });
        }
    }

    private void sendError(Throwable th, ServerWebSocket ws) {
        this.metricsRecorder.onError();
        log.warn("An error occurred while treating a user action", th);
        try {
            ws.writeTextMessage(Json.encode(new JsonObject().put("error", th.getMessage()).put("status", 500)));
        } catch (Exception e) {
            log.warn("Cannot send message to this websocket", e);
            closeWithError("write.error", (short) 500, ws);
        }
    }

    private void closeWithError(String errorMessage, short errorCode, ServerWebSocket ws) {
        this.metricsRecorder.onError();
        ws.close(errorCode, errorMessage, e -> {
            log.warn("Connection closed with error " + errorCode + " - " + errorMessage);
        });
    }

    private int getNbConnections() {
        return wallIdToWSIdToWS.values().size();
    }

    protected void onCloseWSConnection(final String wallId, final String userId, final String wsId) {
        this.collaborativeWallRTService.onUserDisconnection(wallId, userId, wsId)
                .compose(messages -> this.broadcastMessagesToUsers(messages, true, false, wsId))
                .onComplete(e -> {
                    final Map<String, ServerWebSocket> wss = wallIdToWSIdToWS.get(wallId);
                    if (wss != null) {
                        if (wss.remove(wsId) == null) {
                            log.debug("No ws removed");
                        } else {
                            log.debug("WS correctly removed");
                        }
                    }
                });
    }


    /**
     * Triggered when a new user just connected to a wall.
     * We have to fetch the wall, send it back to the user and update the maps of connected users
     *
     * @param user the user that just connected
     * @param wallId Id of the wall to fetch
     * @param wsId   Unique id of the socket
     * @param ws     actual websocket
     */
    private Future<Void> onConnect(final UserInfos user, final String wallId, final String wsId, final ServerWebSocket ws) {
        final Map<String, ServerWebSocket> wsIdToWs = wallIdToWSIdToWS.computeIfAbsent(wallId, k -> new HashMap<>());
        wsIdToWs.put(wsId, ws);
        final Promise<Void> promise = Promise.promise();
        this.collaborativeWallRTService.onNewConnection(wallId, user, wsId)
                .compose(messages -> broadcastMessagesToUsers(messages, true, false, null))
                .onComplete(promise);
        return promise.future();
    }


    /**
     * @param messages   Messages to broadcast to all users connected to this wall
     * @param exceptWsId Id of the websocket that should not receive the messages
     * @return Completes when every message has been sent
     */
    private Future<Void> broadcastMessagesToUsers(final List<CollaborativeWallMessage> messages,
                                                  final boolean allowInternalMessages,
                                                  final boolean allowExternalMessages,
                                                  final String exceptWsId) {
        final List<Future<Object>> futures = messages.stream().map(message -> {
            final String payload = Json.encode(message);
            final String wallId = message.getWallId();
            final Map<String, ServerWebSocket> wsIdToWs = wallIdToWSIdToWS.computeIfAbsent(wallId, k -> new HashMap<>());
            final List<Future<Void>> writeMessagesPromise = wsIdToWs.entrySet().stream()
                    .filter(e -> !e.getKey().equals(exceptWsId))
                    .map(Map.Entry::getValue)
                    .filter(ws -> !ws.isClosed())
                    .map(ws -> {
                        final Promise<Void> writeMessagePromise = Promise.promise();
                        Future<Void> sent;
                        vertx.setTimer(1L, p -> {
                            try {
                                ws.writeTextMessage(payload, writeMessagePromise);
                                writeMessagePromise.future()
                                        .onSuccess(e -> registerSendMetrics(message, allowInternalMessages, allowExternalMessages))
                                        .onFailure(th -> this.metricsRecorder.onSendError());
                            } catch (Throwable e) {
                                log.warn("An exception occurred while writing to ws", e);
                            }
                        });
                        sent = Future.succeededFuture();
                        return sent;
                    }).collect(Collectors.toList());
            return CompositeFuture.join((List) writeMessagesPromise).mapEmpty();
        }).collect(Collectors.toList());
        return CompositeFuture.join((List) futures).mapEmpty();
    }

    private void registerSendMetrics(final CollaborativeWallMessage message, final boolean allowInternalMessages, final boolean allowExternalMessages) {
        final long lifespan = currentTimeMillis() - message.getEmittedAt();
        if (message.getEmittedBy().equals(this.collaborativeWallRTService.getServerId())) {
            if (allowInternalMessages) {
                this.metricsRecorder.onLocalBroadcast(lifespan);
            }
        } else if (allowExternalMessages) {
            this.metricsRecorder.onExternalBroadcast(lifespan);
        }
    }

    private Optional<String> getWallId(String path) {
        final String[] splitted = path.split("/");
        if (splitted.length > 0) {
            return Optional.of(splitted[splitted.length - 1].trim().toLowerCase());
        }
        return Optional.empty();
    }

    private void closeConnections() {
        wallIdToWSIdToWS.values().stream().flatMap(e -> e.values().stream()).forEach(ServerWebSocket::close);
        wallIdToWSIdToWS.clear();
    }

    public int getNumberOfConnectedUsers() {
        return this.wallIdToWSIdToWS.values().stream().mapToInt(e -> e.values().size()).sum();
    }

    public void setMetricsRecorder(CollaborativeWallMetricsRecorder metricsRecorder) {
        this.metricsRecorder = metricsRecorder;
    }
}
