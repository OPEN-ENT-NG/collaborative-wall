package net.atos.entng.collaborativewall.service;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;

import java.util.List;

public interface CollaborativeWallService {
  Future<JsonObject> getWall(final String wallId);
  Future<List<JsonObject>> getNotesOfWall(final String wallId);
}
