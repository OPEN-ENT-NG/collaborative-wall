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

import fr.wseduc.mongodb.MongoDb;
import fr.wseduc.mongodb.MongoQueryBuilder;
import fr.wseduc.mongodb.MongoUpdateBuilder;
import fr.wseduc.rs.ApiDoc;
import fr.wseduc.webutils.Either;
import io.vertx.core.Handler;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.events.CollaborativeWallNote;
import net.atos.entng.collaborativewall.service.NoteService;
import org.bson.conversions.Bson;
import org.entcore.common.mongodb.MongoDbResult;
import org.entcore.common.service.CrudService;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.DateUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.ParseException;
import java.time.Instant;
import java.util.Iterator;

import static com.mongodb.client.model.Filters.*;


public class MongoDbNoteService implements NoteService {

    private static final Logger log = LoggerFactory.getLogger(MongoDbNoteService.class);

    public static final String COLLABORATIVEWALL_NOTES = "collaborativewall.notes";

    //Mongo Collection Fields names

    public static final String NOTES_FIELD_ID = "_id";
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
        Bson query = eq(NOTES_FIELD_IDWALL, idWall);

        JsonObject sort = new JsonObject().put(NOTES_FIELD_LAST_EDIT, 1);

        mongo.find(COLLABORATIVEWALL_NOTES, MongoQueryBuilder.build(query), sort, null, MongoDbResult.validResultsHandler(callback));

    }

    @Override
    @ApiDoc("Retrieve note by id")
    public void get(String id, Handler<Either<String, JsonObject>> callback) {
        final Bson query = eq(NOTES_FIELD_ID, id);
        mongo.findOne(COLLABORATIVEWALL_NOTES, MongoQueryBuilder.build(query), MongoDbResult.validResultHandler(callback));
    }

    public void create(JsonObject note, UserInfos user, Handler<Either<String, JsonObject>> handler) {
        crudService.create(note, user, handler);
    }

    @Override
    @ApiDoc("Allows to delete a collaborative wall associated to the given identifier")
    public void update(String id, JsonObject note, UserInfos user, boolean checkConcurency, Handler<Either<String, JsonObject>> handler) {
        if (note == null) {
            handler.handle(new Either.Left<String, JsonObject>("KO"));
            return;
        }
        updateDBWithConncurrentAccessControl(id, note.getJsonObject(NOTES_FIELD_MODIFIED).getLong(NOTES_MODIFIED_ATTR_DATE), user, handler, note, checkConcurency);

    }

    @Override
    public void delete(String id, Long lastEdit, UserInfos user, boolean checkConcurency, Handler<Either<String, JsonObject>> handler) {
        updateDBWithConncurrentAccessControl(id, lastEdit, user, handler, null, checkConcurency);
    }


    private void updateDBWithConncurrentAccessControl(final String id, final Long lastEdit, final UserInfos user, final Handler<Either<String, JsonObject>> handler, final JsonObject note, final boolean checkConcurrency) {
        //Check if delete is allowed : lastEdit dates from front and in db must matched
        crudService.retrieve(id, user, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> retrieveResponse) {
                if (retrieveResponse.isRight()) {
                    JsonObject noteDB = retrieveResponse.right().getValue();

                    if(noteDB.size()==0){
                        if (note == null) {
                            // already deleted
                            handler.handle(new Either.Right<String, JsonObject>(new JsonObject()));
                            return;
                        } else {
                            //Note doesn't exist any more
                            handler.handle(new Either.Left<String, JsonObject>(ERROR_CODE_NOTE_NOT_EXISTS));
                            return;
                        }
                    }

                    Long lastEditDB = getTimestamp(NOTES_FIELD_MODIFIED, noteDB);

                    if (lastEditDB != null && !lastEditDB.equals(lastEdit) && checkConcurrency) {
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
                            update(id, note, new Handler<Either<String, JsonObject>>() {
                                @Override
                                public void handle(Either<String, JsonObject> now) {
                                    handler.handle(now);
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

    private Long getTimestamp(String notesFieldModified, JsonObject noteDB) {
        Object value = noteDB.getValue(notesFieldModified);
        long ts = -1;
        if(value instanceof Number) {
            ts = (long) value;
        } else if(value instanceof String) {
            try {
                ts = MongoDb.parseDate((String)value).getTime();
            } catch (ParseException e) {
                log.error("Cannot adapt date " + notesFieldModified  + ": " + value, e);
            }
        } else if(value instanceof JsonObject) {
            Object dateValue = ((JsonObject) value).getValue("$date");
            if(dateValue instanceof String) {
                ts = DateUtils.parseIsoDate((JsonObject) value).getTime();
            } else if(dateValue instanceof Number){
                ts = (long) dateValue;
            } else {
                log.error("Cannot adapt date " + notesFieldModified  + ": " + value);
            }
        }
        return ts;
    }

    private void update(String id, JsonObject data, Handler<Either<String, JsonObject>> handler) {
        Bson query = eq("_id", id);
        MongoUpdateBuilder modifier = new MongoUpdateBuilder();
        final JsonObject mongoDBData = CollaborativeWallNote.toMongoDb(data);
        Iterator var7 = mongoDBData.fieldNames().iterator();

        while(var7.hasNext()) {
            String attr = (String)var7.next();
            modifier.set(attr, mongoDBData.getValue(attr));
        }
        final JsonObject now = MongoDb.now();
        modifier.set("modified", now);
        mongo.update(COLLABORATIVEWALL_NOTES, MongoQueryBuilder.build(query), modifier.build(), res -> {
            if ("ok".equals(res.body().getString("status"))){
                handler.handle(new Either.Right(now));
            } else {
                handler.handle(new Either.Left(res.body().getString("message", "")));
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
