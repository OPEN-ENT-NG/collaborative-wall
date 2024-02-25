package net.atos.entng.collaborativewall.events;

import io.vertx.core.json.JsonObject;

import java.util.List;

public class CollaborativeWallContext {
  private final JsonObject wall;
  private final List<JsonObject> notes;
  private final List<CollaborativeWallEditingInformation> editing;

  public CollaborativeWallContext(JsonObject wall, List<JsonObject> notes, List<CollaborativeWallEditingInformation> editing) {
    this.wall = wall;
    this.notes = notes;
    this.editing = editing;
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
}
