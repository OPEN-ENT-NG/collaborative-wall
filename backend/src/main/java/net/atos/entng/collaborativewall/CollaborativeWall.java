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

import io.vertx.core.http.HttpServerOptions;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.controllers.CollaborativeWallController;
import net.atos.entng.collaborativewall.events.CollaborativeWallSearchingEvents;
import net.atos.entng.collaborativewall.explorer.WallExplorerPlugin;
import net.atos.entng.collaborativewall.service.*;
import net.atos.entng.collaborativewall.service.impl.CollaborativeWallMetricsRecorderFactory;
import net.atos.entng.collaborativewall.service.impl.DefaultCollaborativeWallRTService;
import net.atos.entng.collaborativewall.service.impl.MongoDbCollaborativeWallService;
import net.atos.entng.collaborativewall.service.impl.MongoDbNoteService;
import net.atos.entng.collaborativewall.controllers.WallWebSocketController;
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
    public static final String TYPE = "collaborativewall";
    public static final String NOTE_TYPE = "note";
    /**
     * Constant to define the MongoDB collection to use with this module.
     */
    public static final String COLLABORATIVE_WALL_COLLECTION = "collaborativewall";
    public static final String COLLABORATIVE_WALL_NOTES_COLLECTION = "collaborativewall.notes";
    private WallExplorerPlugin plugin;
    private CollaborativeWallRTService collaborativeWallRTService;

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

        final CollaborativeWallController controller = new CollaborativeWallController(COLLABORATIVE_WALL_COLLECTION, noteService, this.plugin);

        addController(controller);

        final CollaborativeWallService collaborativeWallService = new MongoDbCollaborativeWallService(
            controller.getCrudService(),
            noteService);

        final JsonObject rtConfig = config.getJsonObject("real-time");
        if(rtConfig == null) {
            log.info("This instance won't be listening for real time messages");
        } else {
            log.info("Starting real time services");
            CollaborativeWallMetricsRecorderFactory.init(vertx, rtConfig);
            final int port = rtConfig.getInteger("port");
            final int maxConnections = rtConfig.getInteger("max-connections", 0);
            this.collaborativeWallRTService = new DefaultCollaborativeWallRTService(vertx, rtConfig, collaborativeWallService);
            final WallWebSocketController rtController = new WallWebSocketController(vertx, maxConnections, collaborativeWallRTService);
            final CollaborativeWallMetricsRecorder metricsRecorder = CollaborativeWallMetricsRecorderFactory.getRecorder(rtController, collaborativeWallRTService);
            final HttpServerOptions options = new HttpServerOptions().setMaxWebSocketFrameSize(1024 * 1024);
            vertx.createHttpServer(options)
                .webSocketHandler(rtController)
                .listen(port, asyncResult -> {
                    if(asyncResult.succeeded()) {
                        log.info("Websocket server started for collaborativewall and listening on port " + port);
                        collaborativeWallRTService.start(metricsRecorder)
                            .onSuccess(e -> {
                                log.info("Real time server started");
                                vertx.setPeriodic(30000L, periodic -> {
                                    switch (collaborativeWallRTService.getStatus()) {
                                        case ERROR:
                                        case STOPPED:
                                            log.warn("Real-time server is in state " + collaborativeWallRTService.getStatus() + ". Restarting....");
                                            collaborativeWallRTService.start(metricsRecorder);
                                            break;
                                    }
                                });
                            })
                            .onFailure(th -> log.error("Error while starting real time server", th));
                    } else {
                        log.error("Cannot start websocket controller", asyncResult.cause());
                    }
                });
        }
        this.plugin.start();
    }

    @Override
    public void stop() throws Exception {
        super.stop();
        if(this.plugin != null){
            this.plugin.stop();
        }
        if(this.collaborativeWallRTService != null) {
            this.collaborativeWallRTService.stop();
        }

    }

}
