package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.commons.collections4.CollectionUtils;
import org.entcore.common.validation.ValidationException;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallUserAction {
  private final CollaborativeWallMessageType type;
  private final List<CollaborativeWallNote> notes;
  private final List<NoteMove> move;
  private final String noteId;
  private final CollaborativeWallNote note;
  private final CollaborativeWallDetails wall;
  private final ActionType actionType;
  private final String actionId;

  public enum ActionType{
    Do, Undo, Redo
  }

  @JsonCreator
  public CollaborativeWallUserAction(@JsonProperty("type") final CollaborativeWallMessageType type,
                                     @JsonProperty("notes") List<CollaborativeWallNote> notes,
                                     @JsonProperty("move") final List<NoteMove> move,
                                     @JsonProperty("noteId") final String noteId,
                                     @JsonProperty("note") final CollaborativeWallNote note,
                                     @JsonProperty("wall") final CollaborativeWallDetails wall,
                                     @JsonProperty("actionType") final ActionType actionType,
                                     @JsonProperty("actionId") final String actionId) {
    this.type = type;
    this.notes = notes;
    this.move = move;
    this.noteId = noteId;
    this.note = note;
    this.wall = wall;
    this.actionType = actionType;
    this.actionId = actionId;
  }

  public ActionType getActionType() {
    return actionType;
  }

  public String getActionId() {
    return actionId;
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
