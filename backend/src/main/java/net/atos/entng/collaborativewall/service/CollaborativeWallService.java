package net.atos.entng.collaborativewall.service;

import io.vertx.core.Future;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.events.CollaborativeWallDetails;
import net.atos.entng.collaborativewall.events.CollaborativeWallNote;
import org.entcore.common.user.UserInfos;

import java.util.List;

public interface CollaborativeWallService {
  Future<JsonObject> getWall(final String wallId);
  Future<List<JsonObject>> getNotesOfWall(final String wallId);
  Future<CollaborativeWallDetails> updateWall(final String wallId, final CollaborativeWallDetails wall, final UserInfos user);
  Future<Void> deleteWall(final String wallId, final UserInfos user);
  Future<CollaborativeNoteDiff> upsertNote(final String wallId, final CollaborativeWallNote note, final UserInfos user, final boolean checkConcurency);
  Future<CollaborativeWallNote> patchNote(final String wallId, final PatchKind kind, final CollaborativeWallNote note, final UserInfos user, final boolean checkConcurency);
  Future<CollaborativeWallNote> deleteNote(final String wallId, final String noteId, final UserInfos user, final boolean checkConcurency);
  Future<Boolean> canAccess(final String wallId, final UserInfos user);

  enum PatchKind{
    Image, Text, Position
  }

  class CollaborativeNoteDiff{
    public final CollaborativeWallNote oldNote;
    public final CollaborativeWallNote newNote;

    public CollaborativeNoteDiff(CollaborativeWallNote oldNote, CollaborativeWallNote newNote) {
      this.oldNote = oldNote;
      this.newNote = newNote;
    }
  }
}
