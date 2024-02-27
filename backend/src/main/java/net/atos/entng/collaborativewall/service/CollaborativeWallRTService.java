package net.atos.entng.collaborativewall.service;

import io.vertx.core.Future;
import io.vertx.core.Handler;
import net.atos.entng.collaborativewall.events.CollaborativeWallMessage;
import net.atos.entng.collaborativewall.events.RealTimeStatus;

import java.util.List;

/**
 * Handles the real-time aspects of the collaborative walls.
 */
public interface CollaborativeWallRTService {
  /** Start to process real time events
   * @return A Future that completes when the service is ready to accept real time connections .*/
  Future<Void> start(final CollaborativeWallMetricsRecorder metricsRecorder);

  void unsubscribeToStatusChanges(Handler<RealTimeStatus> subscriber);

  /**
   * @return The current status of the real-time server
   */
  RealTimeStatus getStatus();

  /**
   * @return Stop the processing of real-time events
   */
  Future<Void> stop();

  /**
   * To be called when a user opens a connection to a collaborative wall.
   * @param wallId Id of the wall to which the user is connecting
   * @param userId Id of the user who is connecting to the wall
   * @param wsId Id of the socket of the user
   * @return The list of messages that have to be dispatched to the subscriber of the wall in response to this connection.
   */
  Future<List<CollaborativeWallMessage>> onNewConnection(final String wallId, final String userId, final String wsId);

  /**
   * To be called when a user with an open connection sends a message.
   * @param message Message sent by the user
   * @param wallId Id to which the user is connected
   * @param wsId Id of the connection of the user
   * @return List of messages that should be dispatched to <b>other</b> users in response to the incoming emssage
   */
  Future<List<CollaborativeWallMessage>> onNewUserMessage(final String message, final String wallId,
                                                          final String wsId);

  /**
   * To be called when a user closes their connection. The underlying implementation will clean the resources allocated
   * to this user.
   * @param wallId Id of the collaborative wall to which the user was connected
   * @param userId Id of the disconnecting user
   * @param wsId Id of the connection of the user
   * @return List of messages to dispatch to <b>other</b> users in response to this disconnection
   */
  Future<List<CollaborativeWallMessage>> onUserDisconnection(final String wallId, final String userId, final String wsId);

  /**
   * Registers a handler that will receive "internal" messages (messages coming from other instances) to dispatch to
   * connected clients
   * @param subscriber Subscriber that takes as an input the list of messages generated by this service.
   */
  void subscribeToNewMessagesToSend(final Handler<List<CollaborativeWallMessage>> subscriber);

  /**
   * Registers a callback that will be invoked every time the status of the server changes.
   * @param subscriber The callback that will receive the new status of the server
   */
  void subscribeToStatusChanges(Handler<RealTimeStatus> subscriber);

  String getServerId();
}
