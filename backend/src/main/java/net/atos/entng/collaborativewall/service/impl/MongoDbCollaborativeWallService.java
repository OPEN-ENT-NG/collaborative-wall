package net.atos.entng.collaborativewall.service.impl;

import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.service.CollaborativeWallService;
import net.atos.entng.collaborativewall.service.NoteService;
import org.entcore.common.service.CrudService;

import java.util.List;

public class MongoDbCollaborativeWallService implements CollaborativeWallService {

  private final CrudService crudService;

  private final NoteService noteService;

  public MongoDbCollaborativeWallService(final CrudService crudService,
                                         final NoteService noteService) {
    this.crudService = crudService;
    this.noteService = noteService;
  }

  @Override
  public Future<JsonObject> getWall(String wallId) {
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
  public Future<List<JsonObject>> getNotesOfWall(String wallId) {
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
}
