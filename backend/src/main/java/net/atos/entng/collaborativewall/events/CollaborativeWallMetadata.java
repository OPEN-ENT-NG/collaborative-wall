package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * All the metadata concerning a collaborative wall.
 */
public class CollaborativeWallMetadata {
  /** Wall data.*/
  private final CollaborativeWallDetails wall;
  /** All the notes of the wall.*/
  private final List<CollaborativeWallNote> notes;
  /** List of users who are currently editing a note.*/
  private final List<CollaborativeWallEditingInformation> editing;
  /** Ids of the users connected to the wall.*/
  private final Set<String> connectedUsers;

  @JsonCreator
  public CollaborativeWallMetadata(@JsonProperty("wall") final CollaborativeWallDetails wall,
                                   @JsonProperty("notes") final List<CollaborativeWallNote> notes,
                                   @JsonProperty("editing") final List<CollaborativeWallEditingInformation> editing,
                                   @JsonProperty("connectedUsers") final Set<String> connectedUsers) {
    this.wall = wall;
    this.notes = notes;
    this.editing = editing;
    this.connectedUsers = connectedUsers;
  }
  public CollaborativeWallMetadata(final JsonObject wall,
                                   final List<JsonObject> notes,
                                   final List<CollaborativeWallEditingInformation> editing,
                                   final Set<String> connectedUsers) {
    this(CollaborativeWallDetails.fromJson(wall), notes.stream().map(note -> CollaborativeWallNote.fromJson(note)).collect(Collectors.toList()), editing, connectedUsers);
  }

  public CollaborativeWallDetails getWall() {
    return wall;
  }

  public List<CollaborativeWallNote> getNotes() {
    return notes;
  }

  public List<CollaborativeWallEditingInformation> getEditing() {
    return editing;
  }

  public Set<String> getConnectedUsers() {
    return connectedUsers;
  }
}
