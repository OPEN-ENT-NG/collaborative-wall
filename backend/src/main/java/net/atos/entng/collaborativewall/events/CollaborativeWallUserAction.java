package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallUserAction {
  private final CollaborativeWallMessageType type;
  private final List<JsonObject> notes;
  private final List<NoteMove> move;

  @JsonCreator
  public CollaborativeWallUserAction(@JsonProperty("type") final CollaborativeWallMessageType type,
                                     @JsonProperty("notes") List<JsonObject> notes,
                                     @JsonProperty("move") final List<NoteMove> move) {
    this.type = type;
    this.notes = notes;
    this.move = move;
  }

  public CollaborativeWallMessageType getType() {
    return type;
  }

  public List<NoteMove> getMove() {
    return move;
  }

  public List<JsonObject> getNotes() {
    return notes;
  }
}
