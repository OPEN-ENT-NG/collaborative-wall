/*
 * Copyright © Département 77, Région Ile-De-France, Mairie de Paris, Région Poitou-Charente , 2018.
 *
 * This file is part of OPEN ENT NG. OPEN ENT NG is a versatile ENT Project based on the JVM and ENT Core Project.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation (version 3 of the License).
 *
 * For the sake of explanation, any module that communicate over native
 * Web protocols, such as HTTP, with OPEN ENT NG is outside the scope of this
 * license and could be license under its own terms. This is merely considered
 * normal use of OPEN ENT NG, and does not fall under the heading of "covered work".
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 */
package net.atos.entng.collaborativewall.service.impl;

import com.mongodb.QueryBuilder;
import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.service.NoteService;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.service.CrudService;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.user.UserInfos;

public class MongoDbNoteService implements NoteService {


    public static final String COLLABORATIVEWALL_NOTES = "collaborativewall.notes";

    //Mongo Collection Fields names

    public static final String NOTES_FIELD_IDWALL = "idwall";
    public static final String NOTES_FIELD_LAST_EDIT = "lastEdit";
    public static final String NOTES_FIELD_MODIFIED = "modified";
    public static final String NOTES_MODIFIED_ATTR_DATE = "$date";
    public static final String ERROR_CODE_ACCESS_CONCURRENT = "collaborativewall.access.concurrent.error";
    public static final String ERROR_CODE_NOTE_NOT_EXISTS = "collaborativewall.not.exists.error";
    public static final String WALL_FIELD_ID = "_id";
    public static final String NOTES_FIELD_NOTESCOUNT = "nbnotes";

    public static final String MONGO_RESULT_COUNT_FIELD = "count";

    protected final String notes_collection;
    protected final MongoDb mongo;
    protected final CrudService crudService;

    public MongoDbNoteService(final String notes_collection) {
        this.notes_collection = notes_collection;
        this.mongo = MongoDb.getInstance();
        crudService = new MongoDbCrudService(this.notes_collection);
    }

    public void listAllNotes(String idWall, Handler<Either<String, JsonArray>> callback) {
        QueryBuilder query = QueryBuilder.start(NOTES_FIELD_IDWALL).is(idWall);

        JsonObject sort = new JsonObject().put(NOTES_FIELD_LAST_EDIT, 1);

        mongo.find(COLLABORATIVEWALL_NOTES, MongoQueryBuilder.build(query), sort, null, MongoDbResult.validResultsHandler(callback));

    }

    public void create(JsonObject note, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        crudService.create(note, user, handler);
    }

    @ApiDoc("Allows to delete a collaborative wall associated to the given identifier")
    public void update(String id, JsonObject note, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        if (note == null) {
            handler.handle(new Either.Left<String, JsonObject>("KO"));
            return;
        }
        updateDBWithConncurrentAccessControl(id, note.getJsonObject(NOTES_FIELD_MODIFIED).getLong(NOTES_MODIFIED_ATTR_DATE), user, handler, note);

    }

    public void delete(String id, Long lastEdit, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        updateDBWithConncurrentAccessControl(id, lastEdit, user, handler, null);
    }


    private void updateDBWithConncurrentAccessControl(final String id, final Long lastEdit, final UserInfos user, final Handler<Either<String, JsonObject>> handler, final JsonObject note) {
        //Check if delete is allowed : lastEdit dates from front and in db must matched
        crudService.retrieve(id, user, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> retrieveResponse) {
                if (retrieveResponse.isRight()) {
                    JsonObject noteDB = retrieveResponse.right().getValue();

                    if(noteDB.size()==0){
                        //Note doesn't exist any more
                        handler.handle(new Either.Left<String, JsonObject>(ERROR_CODE_NOTE_NOT_EXISTS));
                        return;
                    }

                    Long lastEditDB = noteDB.getJsonObject(NOTES_FIELD_MODIFIED).getLong(NOTES_MODIFIED_ATTR_DATE);

                    if (lastEditDB != null && !lastEditDB.equals(lastEdit)) {
                        //Concurrent access
                        handler.handle(new Either.Left<String, JsonObject>(ERROR_CODE_ACCESS_CONCURRENT));
                    } else {
                        //lastEdit dates match
                        if (note == null) {
                            //=> delete is allowed
                            crudService.delete(id, user, new Handler<Either<String, JsonObject>>() {
                                @Override
                                public void handle(Either<String, JsonObject> deleteResponse) {
                                    handler.handle(deleteResponse);
                                }
                            });
                        } else {
                            //=> update is allowed
                            crudService.update(id, note, user, new Handler<Either<String, JsonObject>>() {
                                @Override
                                public void handle(Either<String, JsonObject> updateResponse) {
                                    handler.handle(updateResponse);
                                }
                            });

                        }
                    }
                } else {
                    handler.handle(retrieveResponse);
                }
            }
        });
    }

    public void removeAllNotes(String idWall, Handler<Either<String, JsonObject>> callback) {
        if (idWall == null) {
            callback.handle(new Either.Left<String, JsonObject>("idwall required"));
        }
        JsonObject query = new JsonObject();
        query.put(NOTES_FIELD_IDWALL, idWall);
        mongo.delete(COLLABORATIVEWALL_NOTES, query, MongoDbResult.validActionResultHandler(callback));
    }

    /**
     * Count notes on a wall
     *
     */
    public void countNotes(JsonArray walls, Handler<Either<String, JsonArray>> callback) {
       if (walls == null) {
            callback.handle(new Either.Left<String, JsonArray>("walls list required"));
        }

        recurseCountNotes(walls, 0 , callback);

    }

    private void recurseCountNotes(final JsonArray walls, final int index, final Handler<Either<String,JsonArray>>callback) {
        if(walls == null || walls.size() == index) {
            // no more walls to threat, so callback
            callback.handle(new Either.Right<String,JsonArray > (walls));
        }else {
            final JsonObject wall = walls.getJsonObject(index);
            String idWall = wall.getString(WALL_FIELD_ID);
            JsonObject matcher = new JsonObject();
             matcher.put(NOTES_FIELD_IDWALL,idWall );
             mongo.count(COLLABORATIVEWALL_NOTES, matcher, MongoDbResult.validActionResultHandler(new Handler<Either<String, JsonObject>>() {
                 @Override
                 public void handle(Either<String, JsonObject> stringJsonObjectEither) {
                     if(stringJsonObjectEither.isRight()){
                         Long count = stringJsonObjectEither.right().getValue().getLong(MONGO_RESULT_COUNT_FIELD);
                         wall.put(NOTES_FIELD_NOTESCOUNT, count);
                     }
                     recurseCountNotes(walls, index + 1, callback);
                 }
             }));

        }

    }

}
