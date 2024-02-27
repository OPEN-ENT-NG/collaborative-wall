package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Metadata of a wall concerning the actions of the users connected to it.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallUsersMetadata {
  /** Users currently editing notes.*/
  private final List<CollaborativeWallEditingInformation> editing;
  /** Connected users*/
  private final Set<String> connectedUsers;

  public CollaborativeWallUsersMetadata() {
    this.editing = new ArrayList<>();
    this.connectedUsers = new HashSet<>();
  }

  @JsonCreator
  public CollaborativeWallUsersMetadata(@JsonProperty("editing") final List<CollaborativeWallEditingInformation> editing,
                                        @JsonProperty("connectedUsers") final Set<String> connectedUsers) {
    this.editing = editing;
    this.connectedUsers = connectedUsers;
  }

  public List<CollaborativeWallEditingInformation> getEditing() {
    return editing;
  }

  public Set<String> getConnectedUsers() {
    return connectedUsers;
  }

  public static CollaborativeWallUsersMetadata merge(final CollaborativeWallUsersMetadata context1,
                                                     final CollaborativeWallUsersMetadata context2) {
    final List<CollaborativeWallEditingInformation> concatEditing = new ArrayList<>();
    concatEditing.addAll(context1.getEditing());
    concatEditing.addAll(context2.getEditing());
    final Set<String> concatUsers = new HashSet<>();
    concatUsers.addAll(context1.getConnectedUsers());
    concatUsers.addAll(context2.getConnectedUsers());
    return new CollaborativeWallUsersMetadata(concatEditing, concatUsers);
  }

}
