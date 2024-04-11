package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Set;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
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
  private final CollaborativeWallDetails wall;
  private final String noteId;
  private final CollaborativeWallNote note;
  private final CollaborativeWallNote oldNote;

  private final List<CollaborativeWallNote> notes;
  private final List<NoteMove> move;
  private final List<CollaborativeWallEditingInformation> editing;
  private final Set<CollaborativeWallUser> connectedUsers;
  private final CollaborativeWallUserAction.ActionType actionType;
  private final String actionId;

  @JsonCreator
  public CollaborativeWallMessage(@JsonProperty("wallId") final String wallId,
                                  @JsonProperty("emittedAt") final long emittedAt,
                                  @JsonProperty("emittedBy") final String emittedBy,
                                  @JsonProperty("originator") final String originator,
                                  @JsonProperty("type") final CollaborativeWallMessageType type,
                                  @JsonProperty("deletedBy") final String deletedBy,
                                  @JsonProperty("deletedAt") final Long deletedAt,
                                  @JsonProperty("userId") final String userId,
                                  @JsonProperty("wall") final CollaborativeWallDetails wall,
                                  @JsonProperty("noteId") final String noteId,
                                  @JsonProperty("note") final CollaborativeWallNote note,
                                  @JsonProperty("notes") List<CollaborativeWallNote> notes,
                                  @JsonProperty("move") final List<NoteMove> move,
                                  @JsonProperty("editing") final List<CollaborativeWallEditingInformation> editing,
                                  @JsonProperty("connectedUsers") final Set<CollaborativeWallUser> connectedUsers,
                                  @JsonProperty("note") final CollaborativeWallNote oldNote,
                                  @JsonProperty("actionType") final CollaborativeWallUserAction.ActionType actionType,
                                  @JsonProperty("actionId") final String actionId) {
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
    this.oldNote = oldNote;
    this.notes = notes;
    this.move = move;
    this.editing = editing;
    this.connectedUsers = connectedUsers;
    this.actionType = actionType;
    this.actionId = actionId;
  }

  public CollaborativeWallUserAction.ActionType getActionType() {
    return actionType;
  }

  public String getActionId() {
    return actionId;
  }

  public Set<CollaborativeWallUser> getConnectedUsers() {
    return connectedUsers;
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

  public CollaborativeWallDetails getWall() {
    return wall;
  }

  public String getNoteId() {
    return noteId;
  }

  public CollaborativeWallNote getNote() {
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

  public List<CollaborativeWallNote> getNotes() {
    return notes;
  }

  public CollaborativeWallNote getOldNote() {
    return oldNote;
  }
}
