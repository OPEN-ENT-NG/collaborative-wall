package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.entcore.common.user.UserInfos;

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
  private final Set<CollaborativeWallUser> connectedUsers;

  public CollaborativeWallUsersMetadata() {
    this.editing = new ArrayList<>();
    this.connectedUsers = new HashSet<>();
  }

  @JsonCreator
  public CollaborativeWallUsersMetadata(@JsonProperty("editing") final List<CollaborativeWallEditingInformation> editing,
                                        @JsonProperty("connectedUsers") final Set<CollaborativeWallUser> connectedUsers) {
    this.editing = editing;
    this.connectedUsers = connectedUsers;
  }

  public List<CollaborativeWallEditingInformation> getEditing() {
    return editing;
  }

  public Set<CollaborativeWallUser> getConnectedUsers() {
    return connectedUsers;
  }

  public void addConnectedUser(final UserInfos user){
    this.connectedUsers.add(new CollaborativeWallUser(user.getUserId(), user.getUsername()));
  }

  public void removeConnectedUser(final String userId){
    this.connectedUsers.removeIf(user -> user.getId().equals(userId));
    this.getEditing().removeIf(info -> info.getUserId().equals(userId));
  }

  public static CollaborativeWallUsersMetadata merge(final CollaborativeWallUsersMetadata context1,
                                                     final CollaborativeWallUsersMetadata context2) {
    final List<CollaborativeWallEditingInformation> concatEditing = new ArrayList<>();
    concatEditing.addAll(context1.getEditing());
    concatEditing.addAll(context2.getEditing());
    final Set<CollaborativeWallUser> concatUsers = new HashSet<>();
    concatUsers.addAll(context1.getConnectedUsers());
    concatUsers.addAll(context2.getConnectedUsers());
    return new CollaborativeWallUsersMetadata(concatEditing, concatUsers);
  }

}
