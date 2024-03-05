package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Information about a note being edited by a user.
 */
public class CollaborativeWallEditingInformation {
  /** Id of the user editing the note.*/
  private final String userId;
  /** Id of the note being edited. */
  private final String noteId;
  /** Timestamp of the beginning of the edition.*/
  private final long since;

  @JsonCreator
  public CollaborativeWallEditingInformation(@JsonProperty("userId") final String userId,
                                             @JsonProperty("noteId") final String noteId,
                                             @JsonProperty("since") long since) {
    this.userId = userId;
    this.noteId = noteId;
    this.since = since;
  }

  public String getUserId() {
    return userId;
  }

  public String getNoteId() {
    return noteId;
  }

  public long getSince() {
    return since;
  }
}
