package net.atos.entng.collaborativewall.service.impl;

import net.atos.entng.collaborativewall.events.CollaborativeWallMetadata;
import net.atos.entng.collaborativewall.events.CollaborativeWallMessage;
import net.atos.entng.collaborativewall.events.CollaborativeWallMessageType;

import static java.util.Collections.emptyList;

public class CollaborativeMessageFactory {

  private final String serverId;

  /**
   * @param serverId If of the server that will generate the messages.
   */
  public CollaborativeMessageFactory(String serverId) {
    this.serverId = serverId;
  }

  public CollaborativeWallMessage connection(final String wallId, final String wsId, final String userId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
        CollaborativeWallMessageType.connection, null, null,
        userId, null, null, null, emptyList(), emptyList());
  }
  public CollaborativeWallMessage disconnection(final String wallId, final String wsId, final String userId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
        CollaborativeWallMessageType.disconnection, null, null,
        userId, null, null, null, emptyList(), emptyList());
  }

  public CollaborativeWallMessage context(final String wallId, final String wsId, final String userId,
                                          final CollaborativeWallMetadata wallContext) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
        CollaborativeWallMessageType.context, null, null,
        userId, wallContext.getWall(), null, null, emptyList(),
        wallContext.getEditing());
  }
}
