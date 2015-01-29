package net.atos.entng.collaborativewall.controllers;

import org.entcore.common.mongodb.MongoDbControllerHelper;
import org.vertx.java.core.Handler;
import org.vertx.java.core.http.HttpServerRequest;
import org.vertx.java.core.json.JsonObject;

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
    public void shareCollaborativeWallSubmit(HttpServerRequest request) {
        shareJsonSubmit(request, null);
    }

    @Put("/share/remove/:id")
    @ApiDoc("Allows to remove the current sharing of the collaborative wall given by its identifier")
    @SecuredAction(value = "collaborativewall.manager", type = ActionType.RESOURCE)
    public void removeShareCollaborativeWall(HttpServerRequest request) {
        removeShare(request, false);
    }

}
