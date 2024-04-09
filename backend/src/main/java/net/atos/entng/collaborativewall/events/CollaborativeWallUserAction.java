package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.CompositeFuture;
import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.service.CollaborativeWallService;
import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.Pair;
import org.entcore.common.validation.ValidationException;

import java.util.Collections;
import java.util.List;

import static com.google.common.collect.Lists.newArrayList;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallUserAction {
  private final CollaborativeWallMessageType type;
  private final List<CollaborativeWallNote> notes;
  private final List<NoteMove> move;
  private final String noteId;
  private final CollaborativeWallNote note;
  private final CollaborativeWallDetails wall;

  @JsonCreator
  public CollaborativeWallUserAction(@JsonProperty("type") final CollaborativeWallMessageType type,
                                     @JsonProperty("notes") List<CollaborativeWallNote> notes,
                                     @JsonProperty("move") final List<NoteMove> move,
                                     @JsonProperty("noteId") final String noteId,
                                     @JsonProperty("note") final CollaborativeWallNote note,
                                     @JsonProperty("wall") final CollaborativeWallDetails wall) {
    this.type = type;
    this.notes = notes;
    this.move = move;
    this.noteId = noteId;
    this.note = note;
    this.wall = wall;
  }

  public CollaborativeWallMessageType getType() {
    return type;
  }

  public List<NoteMove> getMove() {
    return move;
  }

  public List<CollaborativeWallNote> getNotes() {
    return notes;
  }

  public String getNoteId() {
    return noteId;
  }

  public CollaborativeWallNote getNote() {
    return note;
  }

  public CollaborativeWallDetails getWall() {
    return wall;
  }

  public boolean isValid(){
    if(this.type==null){
      throw new ValidationException("wall.action.type.missing");
    }
    switch(this.type){
      case connection:
      case disconnection:
      case metadata:
      case ping:
      case wallDeleted: {
        // no required fields
        break;
      }
      case cursorMove: {
        if(CollectionUtils.isEmpty(this.move)){
          throw new ValidationException("wall.action.move.missing");
        }
        break;
      }
      case noteAdded:
      case noteMoved:
      case noteUpdated: {
        if(this.note == null){
          throw new ValidationException("wall.action.note.missing");
        }
        break;
      }
      case noteDeleted:
      case noteEditionEnded:
      case noteEditionStarted:
      case noteSelected:
      case noteUnselected:{
        if(this.noteId == null){
          throw new ValidationException("wall.action.noteId.missing");
        }
        break;
      }
      case wallUpdate:{
        if(this.wall == null){
          throw new ValidationException("wall.action.wall.missing");
        }
        break;
      }
    }
    return true;
  }
}
