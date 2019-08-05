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

import fr.wseduc.rs.*;
import fr.wseduc.security.ActionType;
import fr.wseduc.security.SecuredAction;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import fr.wseduc.webutils.I18n;
import net.atos.entng.collaborativewall.CollaborativeWall;
import net.atos.entng.collaborativewall.controllers.helpers.NotesHelper;
import net.atos.entng.collaborativewall.service.NoteService;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerRequest;
import org.vertx.java.core.http.RouteMatcher;
import io.vertx.core.json.JsonObject;
import io.vertx.core.json.JsonArray;


import java.util.Map;

/**
 * Controller to manage URL paths for collaborative walls.
 *
 * @author Atos
 */
public class CollaborativeWallController extends MongoDbControllerHelper {

    private EventStore eventStore;
    private enum CollaborativeWallEvent {ACCESS}

    private final NotesHelper notesHelper;

	@Override
	public void init(Vertx vertx, JsonObject config, RouteMatcher rm,
			Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
    try {
      super.init(vertx, config, rm, securedActions);
    } catch (Exception e) {
      log.error(e.getMessage(), e);
    }
    this.notesHelper.init(vertx, config, rm, securedActions);
		eventStore = EventStoreFactory.getFactory().getEventStore(CollaborativeWall.class.getSimpleName());
	}

    /**
     * Default constructor.
     *
     * @param collection MongoDB collection to request.
     */
    public CollaborativeWallController(String collection, NoteService noteService) {
        super(collection);
        this.notesHelper = new NotesHelper(noteService);
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


    @Get("/printall/wall")
    public void printAll(HttpServerRequest request) {
        renderView(request, null, "printall.html", null);
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
    public void list(final HttpServerRequest request) {
        UserUtils.getUserInfos(this.eb, request, new Handler<UserInfos>() {
            public void handle(UserInfos user) {
                VisibilityFilter v = VisibilityFilter.ALL;
                CollaborativeWallController.this.crudService.list(v, user, addNotesCountHandler(request));
            }
        });


    }

    private Handler<Either<String, JsonArray>> addNotesCountHandler(final HttpServerRequest request) {
        return new Handler<Either<String, JsonArray>>() {
            @Override
            public void handle(final Either<String, JsonArray> event) {
                if (event.isRight()) {
                    final JsonArray walls = event.right().getValue();

                    notesHelper.countNotes(walls, new Handler<Either<String, JsonArray>>() {
                                @Override
                                public void handle(Either<String, JsonArray> countNotesResponse) {
                                   Renders.renderJson(request, walls);
                                }
                            }
                    );

                } else {
                    JsonObject error = (new JsonObject()).put("error", event.left().getValue());
                    Renders.renderJson(request, error, 400);
                }
            }
        };
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

    @Override
    @Delete("/:id")
    @ApiDoc("Allows to delete a collaborative wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.manager", type = ActionType.RESOURCE)
    public void delete(final HttpServerRequest request) {
        String idWall = NotesHelper.extractParameter(request, "id");
        notesHelper.removeAllNotes(idWall, new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(Either<String, JsonObject> res) {
                if (res.isRight()) {
                    CollaborativeWallController.super.delete(request);
                } else {
                    renderError(request);
                }
            }
        });


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
        request.pause();
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    final String id = request.params().get("id");
                    if (id == null || id.trim().isEmpty()) {
                        badRequest(request);
                        return;
                    }

                    JsonObject params = new JsonObject();
                    params.put("uri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
                    .put("username", user.getUsername())
                    .put("cwallUri", "/collaborativewall#/view/" + id)
                    .put("resourceUri", params.getString("cwallUri"));

                    crudService.retrieve(id, event -> {
                        request.resume();
                        if (event.isRight()) {
                            JsonObject pushNotif = new JsonObject()
                                    .put("title", "timeline.cwall.push.notif.shared")
                                    .put("body", I18n.getInstance().translate(
                                            "collaborativewall.push.notif.shared",
                                            getHost(request),
                                            I18n.acceptLanguage(request),
                                            user.getUsername(),
                                            event.right().getValue().getString("name")));
                            params.put("pushNotif", pushNotif);

                            shareJsonSubmit(request, "collaborativewall.share", false, params, "name");
                        } else {
                            renderError(request);
                        }
                    });
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

    @Put("/share/resource/:id")
    @ApiDoc("Allows to update the current sharing of the collaborative wall given by its identifier")
    @SecuredAction(value = "collaborativewall.manager", type = ActionType.RESOURCE)
    public void shareResource(final HttpServerRequest request) {
        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(final UserInfos user) {
                if (user != null) {
                    final String id = request.params().get("id");
                    if(id == null || id.trim().isEmpty()) {
                        badRequest(request, "invalid.id");
                        return;
                    }

                    JsonObject params = new JsonObject();
                    params.put("uri", "/userbook/annuaire#" + user.getUserId() + "#" + user.getType())
                            .put("username", user.getUsername())
                            .put("cwallUri", "/collaborativewall#/view/" + id)
                            .put("resourceUri", params.getString("cwallUri"));

                    shareResource(request, "collaborativewall.share", false, params, "name");
                }
            }
        });
    }

    // NOTES

    @Get("/:id/notes")
    @ApiDoc("Allows to get all Notes of a collaborative wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.read", type = ActionType.RESOURCE)
    public void retrieveAllNotes(HttpServerRequest request) {
        notesHelper.listAllNotes(request);
    }

    @Post("/:id/note")
    @ApiDoc("Allows to create a new note on a collaborativewall")
    @SecuredAction("collaborativewall.createnotes")
    public void createNote(final HttpServerRequest request) {
        notesHelper.create(request);
    }

    @Put("/:id/note/:idnote")
    @ApiDoc("Allows to update a note on a collaborative wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.contrib", type = ActionType.RESOURCE)
    public void updateNote(final HttpServerRequest request) {
        notesHelper.update(request);

    }

    @Delete("/:id/note/:idnote")
    @ApiDoc("Allows to delete a collaborative wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.contrib", type = ActionType.RESOURCE)
    public void deleteNote(final HttpServerRequest request) {
        notesHelper.delete(request);
    }

}
