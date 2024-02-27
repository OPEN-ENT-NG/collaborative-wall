package net.atos.entng.collaborativewall.controllers;

import fr.wseduc.webutils.Server;
import fr.wseduc.webutils.request.CookieHelper;
import fr.wseduc.webutils.request.filter.UserAuthFilter;
import io.vertx.core.*;
import io.vertx.core.http.ServerWebSocket;
import io.vertx.core.json.Json;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import net.atos.entng.collaborativewall.events.CollaborativeWallMessage;
import net.atos.entng.collaborativewall.events.RealTimeStatus;
import net.atos.entng.collaborativewall.service.CollaborativeWallRTService;
import org.apache.commons.collections4.CollectionUtils;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.*;
import java.util.stream.Collectors;

public class WallWebSocketController implements Handler<ServerWebSocket> {
    private final Vertx vertx;
    private static final Logger log = LoggerFactory.getLogger(WallWebSocketController.class);

    private final Map<String, Map<String, ServerWebSocket>> wallIdToWSIdToWS = new HashMap<>();
    private final CollaborativeWallRTService collaborativeWallRTService;
    private final int maxConnections;

    public WallWebSocketController(final Vertx vertx,
                                   final int maxConnections,
                                   final CollaborativeWallRTService collaborativeWallRTService) {
        this.vertx = vertx;
        this.collaborativeWallRTService = collaborativeWallRTService;
        this.collaborativeWallRTService.subscribeToStatusChanges(newStatus -> {
            if(RealTimeStatus.ERROR.equals(newStatus) || RealTimeStatus.STOPPED.equals(newStatus)) {
                this.closeConnections();
            }
        });
        this.collaborativeWallRTService.subscribeToNewMessagesToSend(messages -> {
            if(CollectionUtils.isNotEmpty(messages)) {
                this.broadcastMessagesLocally(messages, null);
            }
        });
        this.maxConnections = maxConnections;
    }

    @Override
    public void handle(ServerWebSocket ws) {
        if(!RealTimeStatus.STARTED.equals(this.collaborativeWallRTService.getStatus())) {
            log.info("This instance is not ready for connections");
            ws.reject(503);
        } else if(maxConnections > 0 && getNbConnections() >= maxConnections) {
            log.info("This instance reached its capacity, it does not accept connections anymore");
            ws.reject(503);
        } else {
            ws.pause();
            log.info("Handle websocket");
            final String sessionId = CookieHelper.getInstance().getSigned(UserAuthFilter.SESSION_ID, ws);
            final Optional<String> maybeWallId = getWallId(ws.path());
            if (!maybeWallId.isPresent()) {
                ws.reject();
                log.error("No wall id provided");
                return;
            }
            final String wallId = maybeWallId.get();
            final String wsId = UUID.randomUUID().toString();
            UserUtils.getSession(Server.getEventBus(vertx), sessionId, infos -> {
                try {
                    if (infos == null) {
                        log.info("Get Session is null");
                        ws.reject();
                        return;
                    }
                    log.info("Get Session is ok");
                    final UserInfos session = UserUtils.sessionToUserInfos(infos);
                    final String userId = session.getUserId();
                    ws.closeHandler(e -> onCloseWSConnection(wallId, userId, wsId));
                    onConnect(userId, wallId, wsId, ws).onSuccess(onSuccess -> {
                        ws.resume();
                        ws.frameHandler(frame -> {
                            if (frame.isBinary()) {
                                log.warn("Binary is not handled");
                            } else {
                                final String message = frame.textData();
                                log.info("Received message : " + message);
                                this.collaborativeWallRTService.onNewUserMessage(message, wallId, wsId);
                            }
                        });
                    }).onFailure(th -> {
                        log.error("An error occurred while opening the websocket", th);
                        ws.close();
                    });
                } catch (Exception e) {
                    ws.resume();
                    ws.close();
                    log.error("An error occurred while treating ws", e);
                }
            });
        }
    }

    private int getNbConnections() {
        return wallIdToWSIdToWS.values().size();
    }

    protected void onCloseWSConnection(final String wallId, final String userId, final String wsId) {
        this.collaborativeWallRTService.onUserDisconnection(wallId, userId, wsId)
        .compose(messages -> this.broadcastMessagesLocally(messages, wsId))
        .onComplete(e -> {
            final Map<String, ServerWebSocket> wss = wallIdToWSIdToWS.get(wallId);
            if (wss != null) {
                if (wss.remove(wsId) == null) {
                    log.warn("No ws removed");
                } else {
                    log.info("WS correctly removed");
                }
            }
        });
    }


    /**
     * Triggered when a new user just connected to a wall.
     * We have to fetch the wall, send it back to the user and update the maps of connected users
     * @param userId Id of the user that just connected
     * @param wallId Id of the wall to fetch
     * @param wsId Unique id of the socket
     * @param ws actual websocket
     */
    private Future<Void> onConnect(final String userId, final String wallId, final String wsId, final ServerWebSocket ws) {
        final Map<String, ServerWebSocket> wsIdToWs = wallIdToWSIdToWS.computeIfAbsent(wallId, k -> new HashMap<>());
        wsIdToWs.put(wsId, ws);
        final Promise<Void> promise = Promise.promise();
        this.collaborativeWallRTService.onNewConnection(wallId, userId, wsId)
        .onSuccess(messages -> broadcastMessagesLocally(messages, null))
        .onFailure(promise::fail);
        return promise.future();
    }


    /**
     *
     * @param messages Messages to broadcast to all users connected to this wall
     * @param exceptWsId Id of the websocket that should not receive the messages
     * @return Completes when every message has been sent
     */
    private Future<Void> broadcastMessagesLocally(final List<CollaborativeWallMessage> messages, final String exceptWsId) {
        final List<Future<Object>> futures = messages.stream().map(message -> {
            final String payload = Json.encode(message);
            final String wallId = message.getWallId();
            final Map<String, ServerWebSocket> wsIdToWs = wallIdToWSIdToWS.computeIfAbsent(wallId, k -> new HashMap<>());
            final List<Future<Void>> writeMessagesPromise = wsIdToWs.entrySet().stream()
                .filter(e -> !e.getKey().equals(exceptWsId))
                .map(Map.Entry::getValue)
                .map(ws -> {
                    final Promise<Void> writeMessagePromise = Promise.promise();
                    ws.writeTextMessage(payload, writeMessagePromise);
                    return writeMessagePromise.future();
                }).collect(Collectors.toList());
            return CompositeFuture.join((List) writeMessagesPromise).mapEmpty();
        }).collect(Collectors.toList());
        return CompositeFuture.join((List) futures).mapEmpty();
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

    private void onNewWebSocketMessage(final String message, final String wallId,
                                       final String wsId, final UserInfos session) {
        throw new RuntimeException("onNewWebSocketMessage.not.implemented");
    }

}
