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
import fr.wseduc.webutils.I18n;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.Vertx;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.CollaborativeWall;
import net.atos.entng.collaborativewall.controllers.helpers.NotesHelper;
import net.atos.entng.collaborativewall.events.CollaborativeWallDetails;
import net.atos.entng.collaborativewall.events.CollaborativeWallUserAction;
import net.atos.entng.collaborativewall.explorer.WallExplorerPlugin;
import net.atos.entng.collaborativewall.service.CollaborativeWallRTService;
import net.atos.entng.collaborativewall.service.CollaborativeWallService;
import net.atos.entng.collaborativewall.service.NoteService;
import net.atos.entng.collaborativewall.service.impl.MongoDbCollaborativeWallService;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.events.EventHelper;
import org.entcore.common.events.EventStore;
import org.entcore.common.events.EventStoreFactory;
import org.entcore.common.explorer.IdAndVersion;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.entcore.common.service.CrudService;
import org.entcore.common.service.VisibilityFilter;
import org.entcore.common.service.impl.MongoDbCrudService;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;
import org.vertx.java.core.http.RouteMatcher;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

/**
 * Controller to manage URL paths for collaborative walls.
 *
 * @author Atos
 */
public class CollaborativeWallController extends MongoDbControllerHelper {
    static final String RESOURCE_NAME = "wall";
    private final EventHelper eventHelper;

    private final NotesHelper notesHelper;
    private final WallExplorerPlugin plugin;
    private final NoteService noteService;
    private CollaborativeWallService collaborativeWallService;
    private Optional<CollaborativeWallRTService> wallRTService = Optional.empty();

	@Override
	public void init(Vertx vertx, JsonObject config, RouteMatcher rm,
			Map<String, fr.wseduc.webutils.security.SecuredAction> securedActions) {
        try {
          super.init(vertx, config, rm, securedActions);
        } catch (Exception e) {
          log.error(e.getMessage(), e);
        }
        this.notesHelper.init(vertx, config, rm, securedActions);
        final Map<String, List<String>> groupedActions = new HashMap<>();
        this.shareService = plugin.createShareService(groupedActions);
        this.collaborativeWallService =  new MongoDbCollaborativeWallService(this.crudService, noteService, plugin, securedActions);
	}

    /**
     * Default constructor.
     *
     * @param collection MongoDB collection to request.
     */
    public CollaborativeWallController(String collection, NoteService noteService, WallExplorerPlugin plugin) {
        super(collection);
        this.plugin = plugin;
        final EventStore eventStore = EventStoreFactory.getFactory().getEventStore(CollaborativeWall.class.getSimpleName());
        this.eventHelper = new EventHelper(eventStore);
        this.noteService = noteService;
        this.notesHelper = new NotesHelper(noteService, this.eventHelper);
    }

    public void setWallRTService(final CollaborativeWallRTService wallRTService) {
        this.wallRTService = Optional.ofNullable(wallRTService);
    }

    @Override
    protected boolean shouldNormalizedRights() {
        return true;
    }

    @Override
    protected Function<JsonObject, Optional<String>> jsonToOwnerId() {
        return json -> {
            return plugin.getCreatorForModel(json).map(user -> user.getUserId());
        };
    }

    @Get("")
	@SecuredAction("collaborativewall.view")
	public void collaborativewall(HttpServerRequest request) {
        renderView(request, new JsonObject(), "index.html", null);
		/* final String view = request.params().get("collaborativewall");
		if("home".equals(view)){
			renderView(request, new JsonObject(), "index.html", null);
		} else if("resource".equals(view)){
			// force new ui
			renderView(request, new JsonObject(), "index.html", null);
		} else {
			// use old ui by default for routing
			renderView(request);
		} */
		eventHelper.onAccess(request);
	}

    /**
     * Display react front view /id/:id
     * @param request
     */
    @Get("/id/:id")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void viewById(HttpServerRequest request) {
        renderView(request, new JsonObject(), "index.html", null);
        /* final boolean useNewUi = this.config.getBoolean("use-explorer-ui", true);
        if(useNewUi){
            renderView(request, new JsonObject(), "index.html", null);
        }else{
            // redirect to old ui
            redirect(request, "/collaborativewall#/view/"+request.params().get("id"));
        } */
    }

    /**
     * Display react front view /id/:id/note/:idnote
     * @param request
     */
    @Get("/id/:id/note/:idnote")
    @SecuredAction(value = "collaborativewall.read", type = ActionType.RESOURCE)
    public void viewNote(HttpServerRequest request) {
        renderView(request, new JsonObject(), "index.html", null);
    }

    /**
     * Display react front print /print/id/:id
     * @param request
     */
    @Get("/print/id/:id")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void viewPrintById(HttpServerRequest request) {
        renderView(request, new JsonObject(), "index.html", null);
    }

    @Deprecated
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
        // valiate payload
        RequestUtils.bodyToJson(request, pathPrefix + "collaborativewall", wall -> {
            // get user
            UserUtils.getUserInfos(eb, request, user ->{
                if (user != null) {
                    final Handler<Either<String, JsonObject>> handler = DefaultResponseHandler.notEmptyResponseHandler(request);
                    // create wall
                    crudService.create(wall, user, (r) -> {
                        if (r.isLeft()) {
                            // if fail return error
                            handler.handle(new Either.Left<>(r.left().getValue()));
                        } else {
                            // notify creation event
                            eventHelper.onCreateResource(request, RESOURCE_NAME);
                            // notify EUR
                            wall.put("version", System.currentTimeMillis());
                            wall.put("_id", r.right().getValue().getString("_id"));
                            plugin.setCreatorForModel(user, wall);
                            plugin.notifyUpsert(user, wall).onSuccess(e -> {
                                // on success return 200
                                handler.handle(r);
                            }).onFailure(e -> {
                                // on error return message
                                handler.handle(new Either.Left<>(e.getMessage()));
                            });
                        }
                    });
                } else {
                    unauthorized(request);
                }
            });
        });
    }

    @Override
    @Get("/:id")
    @ApiDoc("Allows to get a collaborative wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.read", type = ActionType.RESOURCE)
    public void retrieve(HttpServerRequest request) {
        UserUtils.getAuthenticatedUserInfos(this.eb, request).onSuccess(user -> {
            String id = request.params().get("id");
            this.crudService.retrieve(id, user,  result -> {
                try{
                    if(result.isRight()){
                        final JsonObject json = CollaborativeWallDetails.fromJson(result.right().getValue()).toJson();
                        Renders.renderJson(request, this.addNormalizedRights(json));
                    }else{
                        final JsonObject error = (new JsonObject()).put("error", result.left().getValue());
                        Renders.renderJson(request, error, 400);
                    }
                }catch (Exception e){
                    log.error("Retrieve wall failed:", e);
                    Renders.renderError(request, new JsonObject().put("error","unexpected.error"));
                }
            });
        });
    }

    @Override
    @Put("/:id")
    @ApiDoc("Allows to update a collaborative wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.manager", type = ActionType.RESOURCE)
    public void update(final HttpServerRequest request) {
        final String id = request.params().get("id");
        // validate payload
        RequestUtils.bodyToJson(request, pathPrefix + "collaborativewall", wall -> {
            // get user
            UserUtils.getUserInfos(eb, request, user ->{
                if (user != null) {
                    final Handler<Either<String, JsonObject>> handler = DefaultResponseHandler.notEmptyResponseHandler(request);
                    // update wall
                    crudService.update(id, wall, user, (r) -> {
                        if (r.isLeft()) {
                            // if fail return error
                            handler.handle(new Either.Left<>(r.left().getValue()));
                        } else {
                            // notify EUR
                            wall.put("_id", id);
                            wall.put("version", System.currentTimeMillis());
                            plugin.notifyUpsert(user, wall).onSuccess(e -> {
                                // on success return 200
                                handler.handle(r);
                            }).onFailure(e -> {
                                // on error return message
                                handler.handle(new Either.Left<>(e.getMessage()));
                            });
                        }
                    });
                } else {
                    unauthorized(request);
                }
            });
        });
    }

    @Override
    @Delete("/:id")
    @ApiDoc("Allows to delete a collaborative wall associated to the given identifier")
    @SecuredAction(value = "collaborativewall.manager", type = ActionType.RESOURCE)
    public void delete(final HttpServerRequest request) {
        final String idWall = NotesHelper.extractParameter(request, "id");
        notesHelper.removeAllNotes(idWall, res -> {
            if (res.isRight()) {
                // get user
                UserUtils.getUserInfos(eb, request, user ->{
                    if (user != null) {
                        final Handler<Either<String, JsonObject>> handler = DefaultResponseHandler.notEmptyResponseHandler(request);
                        // delete wall
                        crudService.delete(idWall, user, (r) -> {
                            if (r.isLeft()) {
                                // if fail return error
                                handler.handle(new Either.Left<>(r.left().getValue()));
                            } else {
                                // notify EUR
                                plugin.notifyDeleteById(user, new IdAndVersion(idWall, System.currentTimeMillis())).onSuccess(e -> {
                                    // on success return 200
                                    handler.handle(r);
                                }).onFailure(e -> {
                                    // on error return message
                                    handler.handle(new Either.Left<>(e.getMessage()));
                                });
                            }
                        });
                    } else {
                        unauthorized(request);
                    }
                });
            } else {
                renderError(request);
            }
        });
    }

    @Get("/publish")
    @SecuredAction("collaborativewall.publish")
    public void publish(final HttpServerRequest request) {
        // This route is used to create publish Workflow right, nothing to do
        return;
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
                    .put("cwallUri", "/collaborativewall/view/" + id)
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
                            .put("cwallUri", "/collaborativewall/id/" + id)
                            .put("resourceUri", params.getString("cwallUri"));

                    shareResource(request, "collaborativewall.share", false, params, "name");
                }
            }
        });
    }

    @Put("/:id/event")
    @SecuredAction(value = "", type = ActionType.AUTHENTICATED)
    public void realtimeFallback(HttpServerRequest request) {
        if(!this.wallRTService.isPresent()){
            log.warn("Realtime fallback is disabled");
            renderError(request, new JsonObject().put("error", "realtime.disabled"));
            return;
        }
        final CollaborativeWallRTService service = this.wallRTService.get();
        // check param
        final String id = request.params().get("id");
        if (id == null || id.trim().isEmpty()) {
            badRequest(request, "invalid.id");
            return;
        }
        request.pause();
        UserUtils.getAuthenticatedUserInfos(this.eb, request).onSuccess(user -> {
            // check access to this wall
            this.collaborativeWallService.canAccess(id, user).onFailure(e -> {
                log.error("An error occurred while checking access to wall", e);
                renderError(request, new JsonObject().put("error", "unknown.error"));
            }).onSuccess(canAccess -> {
                if (!canAccess) {
                    forbidden(request);
                    return;
                }
                // get payload
                request.resume();
                RequestUtils.bodyToClass(request,CollaborativeWallUserAction.class).onSuccess(action -> {
                    // push events to others users
                    service.pushEventToAllUsers(id, user, action, true).onSuccess(e -> {
                        noContent(request);
                    }).onFailure(e -> {
                        log.error("An error occurred while pushing event", e);
                        renderError(request, new JsonObject().put("error", "unknown.error"));
                    });
                });
            });
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
    @SecuredAction(value = "collaborativewall.contrib", type = ActionType.RESOURCE)
    public void createNote(final HttpServerRequest request) {
        notesHelper.create(request);
    }

    @Get("/:id/note/:idnote")
    @ApiDoc("Retrieve note of the given :idnote identifier")
    @SecuredAction(value = "collaborativewall.read", type = ActionType.RESOURCE)
    public void getNote(final HttpServerRequest request) {
        notesHelper.get(request);
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

    public CrudService getCrudService() {
        return this.crudService;
    }
}
