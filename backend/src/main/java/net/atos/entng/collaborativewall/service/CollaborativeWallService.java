package net.atos.entng.collaborativewall.service;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

public interface CollaborativeWallService {
  Future<JsonObject> getWall(final String wallId);
}
