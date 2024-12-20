/*
 * Copyright © Région Nord Pas de Calais-Picardie, 2016.
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

package net.atos.entng.collaborativewall.service;

import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.Vertx;
import fr.wseduc.mongodb.MongoQueryBuilder;
import io.vertx.core.eventbus.Message;
import org.bson.conversions.Bson;
import org.entcore.common.service.impl.MongoDbRepositoryEvents;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.eventbus.Message;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.CollaborativeWall;
import org.entcore.common.service.impl.MongoDbRepositoryEvents;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

import static com.mongodb.client.model.Filters.*;


public class CollaborativeWallRepositoryEvents extends MongoDbRepositoryEvents {

    private final MongoDb mongo = MongoDb.getInstance();

    public CollaborativeWallRepositoryEvents(Vertx vertx) {
        super(vertx,"net-atos-entng-collaborativewall-controllers-CollaborativeWallController|delete",null,null);

        this.collectionNameToImportPrefixMap.put(CollaborativeWall.COLLABORATIVE_WALL_COLLECTION, "wall_");
        this.collectionNameToImportPrefixMap.put(CollaborativeWall.COLLABORATIVE_WALL_NOTES_COLLECTION, "note_");
    }

    @Override
    public void exportResources(JsonArray resourcesIds, boolean exportDocuments, boolean exportSharedResources, String exportId, String userId,
                                JsonArray groups, String exportPath, String locale, String host, Handler<Boolean> handler)
    {
        Bson findByAuthor = eq("owner.userId", userId);
        Bson findByShared = or(
            eq("shared.userId", userId),
            in("shared.groupId", groups)
        );
        Bson findByAuthorOrShared = exportSharedResources == false ? findByAuthor : or(findByAuthor,findByShared);

        JsonObject query;

        if(resourcesIds == null)
            query = MongoQueryBuilder.build(findByAuthorOrShared);
        else
        {
            Bson limitToResources = and(findByAuthorOrShared, in("_id", resourcesIds));
            query = MongoQueryBuilder.build(limitToResources);
        }

        final AtomicBoolean exported = new AtomicBoolean(false);

        Map<String, String> prefixMap = this.collectionNameToImportPrefixMap;

        mongo.find(CollaborativeWall.COLLABORATIVE_WALL_COLLECTION, query, new Handler<Message<JsonObject>>()
        {
            @Override
            public void handle(Message<JsonObject> event)
            {
                JsonArray results = event.body().getJsonArray("results");
                if ("ok".equals(event.body().getString("status")) && results != null)
                {
                    results.forEach(elem ->
                    {
                        JsonObject wall = ((JsonObject) elem);
                        wall.put("name", prefixMap.get(CollaborativeWall.COLLABORATIVE_WALL_COLLECTION) + wall.getString("name"));
                    });

                    final Set<String> ids = results.stream().map(res -> ((JsonObject)res).getString("_id")).collect(Collectors.toSet());
                    Bson findByWallId = in("idwall", ids);
                    JsonObject query2 = MongoQueryBuilder.build(findByWallId);

                    mongo.find(CollaborativeWall.COLLABORATIVE_WALL_NOTES_COLLECTION, query2, new Handler<Message<JsonObject>>()
                    {
                        @Override
                        public void handle(Message<JsonObject> event2) {
                            JsonArray results2 = event2.body().getJsonArray("results");
                            if ("ok".equals(event2.body().getString("status")) && results2 != null)
                            {
                                results2.forEach(elem ->
                                {
                                    JsonObject note = ((JsonObject) elem);
                                    note.put("name", prefixMap.get(CollaborativeWall.COLLABORATIVE_WALL_NOTES_COLLECTION) + note.getString("_id"));
                                });
                                results.addAll(results2);

                                createExportDirectory(exportPath, locale, new Handler<String>()
                                {
                                    @Override
                                    public void handle(String path)
                                    {
                                        if (path != null)
                                        {
                                            Handler<Boolean> finish = new Handler<Boolean>()
                                            {
                                                @Override
                                                public void handle(Boolean bool)
                                                {
                                                    exportFiles(results, path, new HashSet<String>(), exported, handler);
                                                }
                                            };

                                            if(exportDocuments == true)
                                                exportDocumentsDependancies(results, path, finish);
                                            else
                                                finish.handle(Boolean.TRUE);

                                        }
                                        else
                                        {
                                            handler.handle(exported.get());
                                        }
                                    }
                                });
                            }
                            else
                            {
                                log.error("Blog : Could not proceed query " + query2.encode(), event2.body().getString("message"));
                                handler.handle(exported.get());
                            }
                        }
                    });
                }
                else
                {
                    log.error("Blog : Could not proceed query " + query.encode(), event.body().getString("message"));
                    handler.handle(exported.get());
                }
            }
        });
    }
}
