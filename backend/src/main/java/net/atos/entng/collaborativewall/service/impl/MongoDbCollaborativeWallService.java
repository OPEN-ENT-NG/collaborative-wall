package net.atos.entng.collaborativewall.service.impl;

import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.service.CollaborativeWallService;
import net.atos.entng.collaborativewall.service.NoteService;
import org.apache.commons.lang3.StringUtils;
import org.entcore.common.service.CrudService;
import org.entcore.common.share.ShareModel;
import org.entcore.common.share.ShareNormalizer;
import org.entcore.common.share.ShareRoles;
import org.entcore.common.user.UserInfos;

import java.util.*;

public class MongoDbCollaborativeWallService implements CollaborativeWallService {

  private final CrudService crudService;

  private final NoteService noteService;
  private final Map<String, SecuredAction> securedActions;

  public MongoDbCollaborativeWallService(final CrudService crudService,
                                         final NoteService noteService,
                                         final Map<String, SecuredAction> securedActions) {
    this.crudService = crudService;
    this.noteService = noteService;
    this.securedActions = securedActions;
  }

  @Override
  public Future<JsonObject> getWall(final String wallId) {
    final Promise<JsonObject> promise = Promise.promise();
    this.crudService.retrieve(wallId, e -> {
      if(e.isLeft()) {
        promise.fail(e.left().getValue());
      } else {
        promise.complete(e.right().getValue());
      }
    });
    return promise.future();
  }

  @Override
  public Future<List<JsonObject>> getNotesOfWall(final String wallId) {
    final Promise<List<JsonObject>> promise = Promise.promise();
    this.noteService.listAllNotes(wallId, e -> {
      if(e.isLeft()) {
        promise.fail(e.left().getValue());
      } else {
        promise.complete(e.right().getValue().getList());
      }
    });
    return promise.future();
  }

  @Override
  public Future<JsonObject> updateWall(final String wallId, final JsonObject wall, final UserInfos user) {
    final Promise<JsonObject> promise = Promise.promise();
    this.crudService.update(wallId, wall, result -> {
      if(result.isRight()){
        promise.complete(wall.put("_id", wallId));
      }else{
        promise.fail(result.left().getValue());
      }
    });
    return promise.future();
  }

  @Override
  public Future<JsonObject> deleteWall(final String wallId, final JsonObject wall, final UserInfos user) {
    final Promise<JsonObject> promise = Promise.promise();
    this.crudService.delete(wallId, result -> {
      if(result.isRight()){
        promise.complete(wall.put("_id", wallId));
      }else{
        promise.fail(result.left().getValue());
      }
    });
    return promise.future();
  }

  @Override
  public Future<JsonObject> upsertNote(final String wallId, final JsonObject note, final UserInfos user) {
    final Promise<JsonObject> promise = Promise.promise();
    final String id = note.getString("_id");
    if(StringUtils.isBlank(id)){
      // create note
      this.noteService.create(note, user, result ->{
        if(result.isRight()){
          promise.complete();
        }else{
          promise.fail(result.left().getValue());
        }
      });
    }else{
      // update note
      this.noteService.update(id, note, user, result ->{
        if(result.isRight()){
          promise.complete(result.right().getValue());
        }else{
          promise.fail(result.left().getValue());
        }
      });
    }
    return promise.future();
  }

  @Override
  public Future<JsonObject> patchNote(final String wallId, final PatchKind kind, final JsonObject note, final UserInfos user) {
    final Promise<JsonObject> promise = Promise.promise();
    // get and check id
    final String id = note.getString("_id");
    if(StringUtils.isBlank(id)){
      promise.fail("note.id.missing");
      return promise.future();
    }
    // get the last version of the note
    this.noteService.get(id, resGet ->{
      if(resGet.isLeft()){
        promise.fail(resGet.left().getValue());
      }else{
        // patch note
        final JsonObject patched = resGet.right().getValue();
        switch(kind){
          case Text:{
            patched.put("content", note.getValue("content"));
            break;
          }
          case Image:{
            patched.put("media", note.getValue("media"));
            break;
          }
          case Position:{
            patched.put("x", note.getValue("x"));
            patched.put("y", note.getValue("y"));
            break;
          }
        }
        // upsert patched note
        this.noteService.update(id, patched, user, resUpdate -> {
          if(resUpdate.isLeft()){
            promise.fail(resUpdate.left().getValue());
          }else{
            promise.complete(patched);
          }
        });
      }
    });
    return promise.future();
  }

  @Override
  public Future<Void> deleteNote(final String wallId, final String noteId, final UserInfos user) {
    final Promise<Void> promise = Promise.promise();
    // get last version of the note
    this.noteService.get(noteId, resGet ->{
      if(resGet.isLeft()){
        promise.fail(resGet.left().getValue());
      }else{
        // skip concurrency
        final Long modified = resGet.right().getValue().getJsonObject(MongoDbNoteService.NOTES_FIELD_MODIFIED, new JsonObject()).getLong(MongoDbNoteService.NOTES_MODIFIED_ATTR_DATE, 0l);
        // delete note
        this.noteService.delete(noteId, modified, user, result ->{
          if(result.isRight()){
            promise.complete();
          }else{
            promise.fail(result.left().getValue());
          }
        });
      }
    });
    return promise.future();
  }

  @Override
  public Future<Boolean> canAccess(final String wallId, final UserInfos user) {
    // get wall
    return this.getWall(wallId).map(wall -> {
      // transformed shared into normalized shares
      final Optional<String> ownerId = Optional.ofNullable(wall.getJsonObject("owner", new JsonObject()).getString("userId"));
      final JsonArray shared = wall.getJsonArray("shared", new JsonArray());
      return new ShareModel(shared, this.securedActions, ownerId);
    }).map(shared -> {
      // check user rights
      final Set<ShareRoles> rights = shared.getNormalizedRightsByUser().getOrDefault(user.getUserId(), Collections.EMPTY_SET);
      return !rights.isEmpty();
    });
  }
}
