package net.atos.entng.collaborativewall.events;

import io.vertx.core.json.JsonObject;

import java.util.List;

public class CollaborativeWallMessage {
  private final String wallId;
  private final long emittedAt;
  private final String emittedBy;
  /** Id of the websocket that generated the message .*/
  private final String originator;
  private final CollaborativeWallMessageType type; // Replace MessageType with your class
  private final String deletedBy;
  private final Long deletedAt;
  private final String userId;
  private final JsonObject wall; // Replace Object with your class
  private final String noteId;
  private final JsonObject note; // Replace Object with your class
  private final List<NoteMove> move; // Replace Move with your class
  private final List<CollaborativeWallEditingInformation> editing; // Replace Editing with your class

  public CollaborativeWallMessage(String wallId, long emittedAt, String emittedBy, String originator, CollaborativeWallMessageType type,
                                  String deletedBy, Long deletedAt, String userId, JsonObject wall, String noteId,
                                  JsonObject note, List<NoteMove> move, List<CollaborativeWallEditingInformation> editing) {
    this.wallId = wallId;
    this.emittedAt = emittedAt;
    this.emittedBy = emittedBy;
    this.originator = originator;
    this.type = type;
    this.deletedBy = deletedBy;
    this.deletedAt = deletedAt;
    this.userId = userId;
    this.wall = wall;
    this.noteId = noteId;
    this.note = note;
    this.move = move;
    this.editing = editing;
  }

  public String getWallId() {
    return wallId;
  }

  public long getEmittedAt() {
    return emittedAt;
  }

  public String getEmittedBy() {
    return emittedBy;
  }

  public CollaborativeWallMessageType getType() {
    return type;
  }

  public String getDeletedBy() {
    return deletedBy;
  }

  public Long getDeletedAt() {
    return deletedAt;
  }

  public String getUserId() {
    return userId;
  }

  public JsonObject getWall() {
    return wall;
  }

  public String getNoteId() {
    return noteId;
  }

  public JsonObject getNote() {
    return note;
  }

  public List<NoteMove> getMove() {
    return move;
  }

  public List<CollaborativeWallEditingInformation> getEditing() {
    return editing;
  }

  public String getOriginator() {
    return originator;
  }
}
