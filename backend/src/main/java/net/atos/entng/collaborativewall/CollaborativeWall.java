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

package net.atos.entng.collaborativewall;

import net.atos.entng.collaborativewall.controllers.CollaborativeWallController;
import net.atos.entng.collaborativewall.events.CollaborativeWallSearchingEvents;
import net.atos.entng.collaborativewall.explorer.WallExplorerPlugin;
import net.atos.entng.collaborativewall.service.CollaborativeWallRepositoryEvents;
import net.atos.entng.collaborativewall.service.NoteService;
import net.atos.entng.collaborativewall.service.impl.MongoDbNoteService;
import org.entcore.common.explorer.IExplorerPluginClient;
import org.entcore.common.explorer.impl.ExplorerRepositoryEvents;
import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;
import org.entcore.common.service.impl.MongoDbSearchService;

import java.util.HashMap;
import java.util.Map;

/**
 * Server to manage collaborative walls. This class is the entry point of the Vert.x module.
 * @author Atos
 */
public class CollaborativeWall extends BaseServer {

    public static final String APPLICATION = "collaborativewall";
    public static final String TYPE = "wall";
    public static final String NOTE_TYPE = "note";
    /**
     * Constant to define the MongoDB collection to use with this module.
     */
    public static final String COLLABORATIVE_WALL_COLLECTION = "collaborativewall";
    public static final String COLLABORATIVE_WALL_NOTES_COLLECTION = "collaborativewall.notes";
    private WallExplorerPlugin plugin;
    /**
     * Entry point of the Vert.x module
     */
    @Override
    public void start() throws Exception {
        super.start();
        // wrap repository event
        final IExplorerPluginClient mainClient = IExplorerPluginClient.withBus(vertx, APPLICATION, TYPE);
        final Map<String, IExplorerPluginClient> pluginClientPerCollection = new HashMap<>();
        pluginClientPerCollection.put(COLLABORATIVE_WALL_COLLECTION, mainClient);
        pluginClientPerCollection.put(COLLABORATIVE_WALL_NOTES_COLLECTION, IExplorerPluginClient.withBus(vertx, APPLICATION, NOTE_TYPE));
        setRepositoryEvents(new ExplorerRepositoryEvents(new CollaborativeWallRepositoryEvents(vertx), pluginClientPerCollection,mainClient));

        if (config.getBoolean("searching-event", true)) {
            setSearchingEvents(new CollaborativeWallSearchingEvents(new MongoDbSearchService(COLLABORATIVE_WALL_COLLECTION)));
        }

        this.plugin = WallExplorerPlugin.create(securedActions);
        MongoDbConf conf = MongoDbConf.getInstance();
        conf.setCollection(COLLABORATIVE_WALL_COLLECTION);
        conf.setResourceIdLabel("id");

        final NoteService noteService = new MongoDbNoteService(COLLABORATIVE_WALL_NOTES_COLLECTION);

        setDefaultResourceFilter(new ShareAndOwner());

        addController(new CollaborativeWallController(COLLABORATIVE_WALL_COLLECTION, noteService, this.plugin));

        this.plugin.start();
    }

    @Override
    public void stop() throws Exception {
        super.stop();
        if(this.plugin != null){
            this.plugin.stop();
        }
    }

}
