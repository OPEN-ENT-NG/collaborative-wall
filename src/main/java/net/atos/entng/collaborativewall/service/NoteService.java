package net.atos.entng.collaborativewall.service;

import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;


public interface NoteService {


    void listAllNotes(String idWall, Handler<Either<String, JsonArray>> callback);

    void create(JsonObject note, UserInfos user, Handler<Either<String, JsonObject>> callback);

    void delete(String id, Long lastEdit, UserInfos user, Handler<Either<String, JsonObject>> callback);

    void update(String id, JsonObject note, UserInfos user, Handler<Either<String, JsonObject>> callback);

    void removeAllNotes(String idWall, Handler<Either<String, JsonObject>> callback);

    void countNotes(JsonArray walls, Handler<Either<String, JsonArray>> callback);
}
