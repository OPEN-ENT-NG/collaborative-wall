package net.atos.entng.collaborativewall.service;

import io.vertx.core.Future;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.events.CollaborativeWallMessage;
import net.atos.entng.collaborativewall.events.RealTimeStatus;
import org.entcore.common.user.UserInfos;

import java.util.List;

public interface CollaborativeWallService {
  Future<Void> start();

  void subscribeToStatusChanges(Handler<RealTimeStatus> subscriber);

  void unsubscribeToStatusChanges(Handler<RealTimeStatus> subscriber);

  RealTimeStatus getStatus();

  Future<Void> stop();

  Future<List<CollaborativeWallMessage>> onNewConnection(final String wallId, final String userId, final String wsId);

  Future<List<CollaborativeWallMessage>> onNewUserMessage(final String message, final String wallId,
                                                          final String wsId, final UserInfos session);

  Future<List<CollaborativeWallMessage>> onUserDisconnection(final String wallId, final String userId, final String wsId);

  void subscribeToNewMessagesToSend(Handler<List<CollaborativeWallMessage>> messages);
}
