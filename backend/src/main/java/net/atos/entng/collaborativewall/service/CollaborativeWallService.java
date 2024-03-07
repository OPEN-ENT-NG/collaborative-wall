package net.atos.entng.collaborativewall.service;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.List;

public interface CollaborativeWallService {
  Future<JsonObject> getWall(final String wallId);
  Future<List<JsonObject>> getNotesOfWall(final String wallId);
  Future<JsonObject> updateWall(final String wallId, final JsonObject wall, final UserInfos user);
  Future<JsonObject> deleteWall(final String wallId, final JsonObject wall, final UserInfos user);
  Future<JsonObject> upsertNote(final String wallId, final JsonObject note, final UserInfos user);
  Future<JsonObject> patchNote(final String wallId, final PatchKind kind, final JsonObject note, final UserInfos user);
  Future<Void> deleteNote(final String wallId, final String noteId, final UserInfos user);
  Future<Boolean> canAccess(final String wallId, final UserInfos user);

  enum PatchKind{
    Image, Text, Position
  }
}
