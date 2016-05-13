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

package net.atos.entng.collaborativewall.controllers;

import java.util.Map;

import net.atos.entng.collaborativewall.CollaborativeWall;

import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.Handler;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.http.RouteMatcher;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.platform.Container;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.rs.Delete;
import fr.wseduc.rs.Get;
import fr.wseduc.rs.Post;
import fr.wseduc.rs.Put;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.request.RequestUtils;

/**
 * Controller to manage URL paths for collaborative walls.
 * @author Atos
 */
public class CollaborativeWallController extends MongoDbControllerHelper {

	private EventStore eventStore;
	private enum CollaborativeWallEvent { ACCESS }

	@Override
	public void init(Vertx vertx, Container container, RouteMatcher rm,
			Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
		super.init(vertx, container, rm, securedActions);
		eventStore = EventStoreFactory.getFactory().getEventStore(CollaborativeWall.class.getSimpleName());
	}

    /**
     * Default constructor.
     * @param collection MongoDB collection to request.
     */
    public CollaborativeWallController(String collection) {
        super(collection);
    }

    @Get("")
    @ApiDoc("Allows to display the main view")
    @SecuredAction("collaborativewall.view")
    public void view(HttpServerRequest request) {
        renderView(request);

		// Create event "access to application CollaborativeWall" and store it, for module "statistics"
		eventStore.createAndStoreEvent(CollaborativeWallEvent.ACCESS.name(), request);
    }

    @Get("/print/wall")
    @ApiDoc("Allows to print a wall")
    @SecuredAction("collaborativewall.print")
    public void print(HttpServerRequest request) {
        renderView(request, null, "print.html", null);
    }

    @Get("/printnotes/wall")
    @ApiDoc("Allows to print notes")
    @SecuredAction("collaborativewall.printnotes")
    public void printnotes(HttpServerRequest request) {
        renderView(request, null, "printnotes.html", null);
    }

    @Override
    @Get("/list/all")
    @ApiDoc("Allows to list all collaborative walls")
    @SecuredAction("collaborativewall.list")
    public void list(HttpServerRequest request) {
        super.list(request);
    }

    @Override
    @Post("")
    @ApiDoc("Allows to create a new collaborative wall")
    @SecuredAction("collaborativewall.create")
    public void create(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "collaborativewall", new Handler<JsonObject>() {

            @Override
            public void handle(JsonObject event) {
                CollaborativeWallController.super.create(request);
            }
        });
    }

    @Override
    @Get("/:id")
    @ApiDoc("Allows to get a collaborative wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.read", type = ActionType.RESOURCE)
    public void retrieve(HttpServerRequest request) {
        super.retrieve(request);
    }

    @Override
    @Put("/:id")
    @ApiDoc("Allows to update a collaborative wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.manager", type = ActionType.RESOURCE)
    public void update(final HttpServerRequest request) {
        RequestUtils.bodyToJson(request, pathPrefix + "collaborativewall", new Handler<JsonObject>() {

            @Override
            public void handle(JsonObject event) {
                CollaborativeWallController.super.update(request);
            }
        });
    }

    @Put("/contribute/:id")
    @ApiDoc("Allows to contribute to the wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.contrib", type = ActionType.RESOURCE)
    public void contribute(HttpServerRequest request) {
        update(request);
    }

    @Override
    @Delete("/:id")
    @ApiDoc("Allows to delete a collaborative wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.manager", type = ActionType.RESOURCE)
    public void delete(HttpServerRequest request) {
        super.delete(request);
    }

    @Get("/share/json/:id")
    @ApiDoc("Allows to get the current sharing of the collaborativew all given by its identifier")
    @SecuredAction(value = "collaborativewall.manager", type = ActionType.RESOURCE)
    public void share(HttpServerRequest request) {
        shareJson(request, false);
    }

    @Put("/share/json/:id")
    @ApiDoc("Allows to update the current sharing of the collaborative wall given by its identifier")
    @SecuredAction(value = "collaborativewall.manager", type = ActionType.RESOURCE)
    public void shareCollaborativeWallSubmit(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>(){
            @Override
            public void handle(final UserInfos user){
                if (user != null) {
                    final String id = request.params().get("id");
                    if (id == null || id.trim().isEmpty()) {
                        badRequest(request);
                        return;
                    }

                    JsonObject params = new JsonObject();
                    params.putString("uri", container.config().getString("host", "http://localhost:8090") +
                    		"/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
                    .putString("username", user.getUsername())
                    .putString("cwallUri", container.config().getString("host", "http://localhost:8090") +
                    		"/collaborativewall#/view/" + id)
                    .putString("resourceUri", params.getString("cwallUri"));

                    shareJsonSubmit(request, "collaborativewall.share", false, params, "name");
                }
            }
        });
    }

    @Put("/share/remove/:id")
    @ApiDoc("Allows to remove the current sharing of the collaborative wall given by its identifier")
    @SecuredAction(value = "collaborativewall.manager", type = ActionType.RESOURCE)
    public void removeShareCollaborativeWall(HttpServerRequest request) {
        removeShare(request, false);
    }

}
