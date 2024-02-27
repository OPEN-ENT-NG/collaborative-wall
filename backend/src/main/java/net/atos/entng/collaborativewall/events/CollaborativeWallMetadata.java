package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.List;
import java.util.Set;

/**
 * All the metadata concerning a collaborative wall.
 */
public class CollaborativeWallMetadata {
  /** Wall data.*/
  private final JsonObject wall;
  /** All the notes of the wall.*/
  private final List<JsonObject> notes;
  /** List of users who are currently editing a note.*/
  private final List<CollaborativeWallEditingInformation> editing;
  /** Ids of the users connected to the wall.*/
  private final Set<String> connectedUsers;

  @JsonCreator
  public CollaborativeWallMetadata(@JsonProperty("wall") final JsonObject wall,
                                   @JsonProperty("notes") final List<JsonObject> notes,
                                   @JsonProperty("editing") final List<CollaborativeWallEditingInformation> editing,
                                   @JsonProperty("connectedUsers") final Set<String> connectedUsers) {
    this.wall = wall;
    this.notes = notes;
    this.editing = editing;
    this.connectedUsers = connectedUsers;
  }

  public JsonObject getWall() {
    return wall;
  }

  public List<JsonObject> getNotes() {
    return notes;
  }

  public List<CollaborativeWallEditingInformation> getEditing() {
    return editing;
  }

  public Set<String> getConnectedUsers() {
    return connectedUsers;
  }
}
