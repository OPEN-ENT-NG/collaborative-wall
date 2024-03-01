package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.List;

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
  private final JsonObject wall;
  private final String noteId;
  private final JsonObject note;

  private final List<JsonObject> notes;
  private final List<NoteMove> move;
  private final List<CollaborativeWallEditingInformation> editing;

  @JsonCreator
  public CollaborativeWallMessage(@JsonProperty("wallId") final String wallId, @JsonProperty("emittedAt") final long emittedAt,
                                  @JsonProperty("emittedBy") final String emittedBy, @JsonProperty("originator") final String originator,
                                  @JsonProperty("type") final CollaborativeWallMessageType type, @JsonProperty("deletedBy") final String deletedBy,
                                  @JsonProperty("deletedAt") final Long deletedAt, @JsonProperty("userId") final String userId,
                                  @JsonProperty("wall") final JsonObject wall, @JsonProperty("noteId") final String noteId,
                                  @JsonProperty("note") final JsonObject note, @JsonProperty("notes") List<JsonObject> notes,
                                  @JsonProperty("move") final List<NoteMove> move,
                                  @JsonProperty("editing") final List<CollaborativeWallEditingInformation> editing) {
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
    this.notes = notes;
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

  public List<JsonObject> getNotes() {
    return notes;
  }
}
