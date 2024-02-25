package net.atos.entng.collaborativewall.service.impl;

import net.atos.entng.collaborativewall.events.CollaborativeWallContext;
import net.atos.entng.collaborativewall.events.CollaborativeWallMessage;
import net.atos.entng.collaborativewall.events.CollaborativeWallMessageType;

import static java.util.Collections.emptyList;

public class CollaborativeMessageFactory {

  public final String serverId;

  public CollaborativeMessageFactory(String serverId) {
    this.serverId = serverId;
  }

  public CollaborativeWallMessage connection(final String wallId, final String wsId, final String userId) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
        CollaborativeWallMessageType.connection, null, null,
        userId, null, null, null, emptyList(), emptyList());
  }

  public CollaborativeWallMessage context(final String wallId, final String wsId, final String userId,
                                          final CollaborativeWallContext wallContext) {
    return new CollaborativeWallMessage(wallId, System.currentTimeMillis(), serverId, wsId,
        CollaborativeWallMessageType.context, null, null,
        userId, wallContext.getWall(), null, null, emptyList(),
        wallContext.getEditing());
  }
}
