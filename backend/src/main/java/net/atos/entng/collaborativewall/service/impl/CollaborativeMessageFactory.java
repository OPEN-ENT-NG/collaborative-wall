package net.atos.entng.collaborativewall.service.impl;

import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.events.*;

import java.util.List;

import static java.util.Collections.emptyList;

public class CollaborativeMessageFactory {

  private final String serverId;

  /**
   * @param serverId If of the server that will generate the messages.
   */
  public CollaborativeMessageFactory(String serverId) {
    this.serverId = serverId;
  }

  public CollaborativeWallMessage connection(final String wallId, final String wsId, final String userId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
        CollaborativeWallMessageType.connection, null, null,
        userId, null, null, null, null, null, null, null, null);
  }
  public CollaborativeWallMessage disconnection(final String wallId, final String wsId, final String userId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
        CollaborativeWallMessageType.disconnection, null, null,
        userId, null, null, null, null, null, null, null, null);
  }

  public CollaborativeWallMessage metadata(final String wallId, final String wsId, final String userId,
                                           final CollaborativeWallMetadata wallContext) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
        CollaborativeWallMessageType.metadata, null, null,
        userId, wallContext.getWall(), null, null, wallContext.getNotes(), null,
        wallContext.getEditing(), wallContext.getConnectedUsers(), null);
  }

  public CollaborativeWallMessage ping(final String wallId, final String wsId, final String userId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.ping, null, null,
            userId, null, null, null, null, null,
            null, null, null);
  }

  public CollaborativeWallMessage cursorMove(final String wallId, final String wsId, final String userId, final String noteId, final List<NoteMove> move) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.cursorMove, null, null,
            userId, null, noteId, null, null, move,
            null, null, null);
  }

  public CollaborativeWallMessage noteAdded(final String wallId, final String wsId, final String userId, final CollaborativeWallNote note) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.noteAdded, null, null,
            userId, null, null, note, null, null,
            null, null, null);
  }

  public CollaborativeWallMessage noteAdded(final String wallId, final String wsId, final String userId, final JsonObject note) {
    return noteAdded(wallId, wsId, userId, CollaborativeWallNote.fromJson(note));
  }

  public CollaborativeWallMessage noteMoved(final String wallId, final String wsId, final String userId, final CollaborativeWallNote note) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.noteMoved, null, null,
            userId, null, null, note, null, null,
            null, null, null);
  }

  public CollaborativeWallMessage noteMoved(final String wallId, final String wsId, final String userId, final JsonObject note) {
    return noteMoved(wallId, wsId, userId, CollaborativeWallNote.fromJson(note));
  }

  public CollaborativeWallMessage noteUpdated(final String wallId, final String wsId, final String userId, final CollaborativeWallNote previousNote, final CollaborativeWallNote newNote) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.noteUpdated, null, null,
            userId, null, null, newNote, null, null,
            null, null, previousNote);
  }

  public CollaborativeWallMessage noteUpdated(final String wallId, final String wsId, final String userId,final JsonObject previousnote, final JsonObject note) {
    return noteUpdated(wallId, wsId, userId, CollaborativeWallNote.fromJson(previousnote), CollaborativeWallNote.fromJson(note));
  }

  public CollaborativeWallMessage wallUpdate(final String wallId, final String wsId, final String userId, final CollaborativeWallDetails wall) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.wallUpdate, null, null,
            userId, wall, null, null, null, null,
            null, null, null);
  }

  public CollaborativeWallMessage wallUpdate(final String wallId, final String wsId, final String userId, final JsonObject wall) {
    return wallUpdate(wallId, wsId, userId, CollaborativeWallDetails.fromJson(wall));
  }

  public CollaborativeWallMessage wallDeleted(final String wallId, final String wsId, final String userId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.wallDeleted, userId, System.currentTimeMillis(),
            userId, null, null, null, null, null,
            null, null, null);
  }

  public CollaborativeWallMessage noteDeleted(final String wallId, final String wsId, final String userId, final String noteId, final CollaborativeWallNote note) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.noteDeleted, null, null,
            userId, null, noteId, note, null, null,
            null, null, null);
  }

  public CollaborativeWallMessage noteEditionEnded(final String wallId, final String wsId, final String userId, final String noteId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.noteEditionEnded, null, null,
            userId, null, noteId, null, null, null,
            null, null, null);
  }

  public CollaborativeWallMessage noteEditionStarted(final String wallId, final String wsId, final String userId, final String noteId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.noteEditionStarted, null, null,
            userId, null, noteId, null, null, null,
            null, null, null);
  }

  public CollaborativeWallMessage noteSelected(final String wallId, final String wsId, final String userId, final String noteId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.noteSelected, null, null,
            userId, null, noteId, null, null, null,
            null, null, null);
  }

  public CollaborativeWallMessage noteUnselected(final String wallId, final String wsId, final String userId, final String noteId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
            CollaborativeWallMessageType.noteUnselected, null, null,
            userId, null, noteId, null, null, null,
            null, null, null);
  }
}
