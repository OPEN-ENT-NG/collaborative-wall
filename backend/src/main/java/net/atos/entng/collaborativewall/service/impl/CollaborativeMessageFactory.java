package net.atos.entng.collaborativewall.service.impl;

import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.events.*;

import java.util.List;

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
                userId, null, null, null, null, null, null, null, null, CollaborativeWallUserAction.ActionType.Do, null);
    }

    public CollaborativeWallMessage disconnection(final String wallId, final String wsId, final String userId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.disconnection, null, null,
                userId, null, null, null, null, null, null, null, null, CollaborativeWallUserAction.ActionType.Do, null);
    }

    public CollaborativeWallMessage metadata(final String wallId, final String wsId, final String userId,
                                             final CollaborativeWallMetadata wallContext) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.metadata, null, null,
                userId, wallContext.getWall(), null, null, wallContext.getNotes(), null,
                wallContext.getEditing(), wallContext.getConnectedUsers(), null, CollaborativeWallUserAction.ActionType.Do, null);
    }

    public CollaborativeWallMessage ping(final String wallId, final String wsId, final String userId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.ping, null, null,
                userId, null, null, null, null, null,
                null, null, null, CollaborativeWallUserAction.ActionType.Do, null);
    }

    public CollaborativeWallMessage cursorMove(final String wallId, final String wsId, final String userId, final String noteId, final List<NoteMove> move, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.cursorMove, null, null,
                userId, null, noteId, null, null, move,
                null, null, null, actionType, actionId);
    }

    public CollaborativeWallMessage noteAdded(final String wallId, final String wsId, final String userId, final CollaborativeWallNote note, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.noteAdded, null, null,
                userId, null, null, note, null, null,
                null, null, null, actionType, actionId);
    }

    public CollaborativeWallMessage noteAdded(final String wallId, final String wsId, final String userId, final JsonObject note, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return noteAdded(wallId, wsId, userId, CollaborativeWallNote.fromJson(note), actionType, actionId);
    }

    public CollaborativeWallMessage noteMoved(final String wallId, final String wsId, final String userId, final CollaborativeWallNote note, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.noteMoved, null, null,
                userId, null, null, note, null, null,
                null, null, null, actionType, actionId);
    }

    public CollaborativeWallMessage noteMoved(final String wallId, final String wsId, final String userId, final JsonObject note, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return noteMoved(wallId, wsId, userId, CollaborativeWallNote.fromJson(note), actionType, actionId);
    }

    public CollaborativeWallMessage noteUpdated(final String wallId, final String wsId, final String userId, final CollaborativeWallNote previousNote, final CollaborativeWallNote newNote, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.noteUpdated, null, null,
                userId, null, null, newNote, null, null,
                null, null, previousNote, actionType, actionId);
    }

    public CollaborativeWallMessage noteUpdated(final String wallId, final String wsId, final String userId, final JsonObject previousnote, final JsonObject note, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return noteUpdated(wallId, wsId, userId, CollaborativeWallNote.fromJson(previousnote), CollaborativeWallNote.fromJson(note), actionType, actionId);
    }

    public CollaborativeWallMessage wallUpdate(final String wallId, final String wsId, final String userId, final CollaborativeWallDetails wall, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.wallUpdate, null, null,
                userId, wall, null, null, null, null,
                null, null, null, actionType, actionId);
    }

    public CollaborativeWallMessage wallUpdate(final String wallId, final String wsId, final String userId, final JsonObject wall, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return wallUpdate(wallId, wsId, userId, CollaborativeWallDetails.fromJson(wall), actionType, actionId);
    }

    public CollaborativeWallMessage wallDeleted(final String wallId, final String wsId, final String userId, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.wallDeleted, userId, System.currentTimeMillis(),
                userId, null, null, null, null, null,
                null, null, null, actionType, actionId);
    }

    public CollaborativeWallMessage noteDeleted(final String wallId, final String wsId, final String userId, final String noteId, final CollaborativeWallNote note, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.noteDeleted, null, null,
                userId, null, noteId, note, null, null,
                null, null, null, actionType, actionId);
    }

    public CollaborativeWallMessage noteEditionEnded(final String wallId, final String wsId, final String userId, final String noteId, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.noteEditionEnded, null, null,
                userId, null, noteId, null, null, null,
                null, null, null, actionType, actionId);
    }

    public CollaborativeWallMessage noteEditionStarted(final String wallId, final String wsId, final String userId, final String noteId, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.noteEditionStarted, null, null,
                userId, null, noteId, null, null, null,
                null, null, null, actionType, actionId);
    }

    public CollaborativeWallMessage noteSelected(final String wallId, final String wsId, final String userId, final String noteId, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.noteSelected, null, null,
                userId, null, noteId, null, null, null,
                null, null, null, actionType, actionId);
    }

    public CollaborativeWallMessage noteUnselected(final String wallId, final String wsId, final String userId, final String noteId, final CollaborativeWallUserAction.ActionType actionType, final String actionId) {
        return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
                CollaborativeWallMessageType.noteUnselected, null, null,
                userId, null, noteId, null, null, null,
                null, null, null, actionType, actionId);
    }
}
