package net.atos.entng.collaborativewall.service.impl;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.service.CollaborativeWallService;

public class MongoDbCollaborativeWallService implements CollaborativeWallService {
  @Override
  public Future<JsonObject> getWall(String wallId) {
    throw new RuntimeException("getWall.not.implemented");
  }
}
