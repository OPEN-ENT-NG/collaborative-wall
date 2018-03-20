package net.atos.entng.collaborativewall.controllers.helpers;

import fr.wseduc.rs.ApiDoc;
import fr.wseduc.webutils.Either;
import fr.wseduc.webutils.http.Renders;
import fr.wseduc.webutils.request.RequestUtils;
import io.vertx.core.Handler;
import io.vertx.core.http.HttpServerRequest;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.service.NoteService;
import org.entcore.common.controller.ControllerHelper;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

public class NotesHelper extends ControllerHelper {


    public static final String WALL_ID_PARAMETER = "id";
    public static final String NOTE_ID_PARAMETER = "idnote";
    public static final String NOTE_MODIFIED_ATTR = "modified";
    public static final String NOTE_MODIFIED_DATE_FIELD = "$date";
    public static final String NOTE_LASTEDIT_PARAMETER = "lastEdit";
    private final NoteService noteService;

    public NotesHelper(final NoteService noteService) {
        super();
        this.noteService = noteService;
    }

    public void listAllNotes(HttpServerRequest request) {
        final String idWall = extractParameter(request, WALL_ID_PARAMETER);
        if (idWall == null) {
            return;
        }

        noteService.listAllNotes(idWall, DefaultResponseHandler.arrayResponseHandler(request));

    }


    /**
     * Create a note on a wall.
     * Do nothing if wall id is null
     * <p>
     * Response contains all notes of the wall.
     *
     * @param request - request
     */
    public void create(final HttpServerRequest request) {

        final String idWall = extractParameter(request, WALL_ID_PARAMETER);
        if (idWall == null) {
            return;
        }

        RequestUtils.bodyToJson(request, pathPrefix + "collaborativewallnote", new Handler<JsonObject>() {

            @Override
            public void handle(final JsonObject body) {
                UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                    @Override
                    public void handle(UserInfos user) {
                        noteService.create(body, user, listAllNotesHandler(idWall, request));
                    }
                });
            }
        });
    }

    public void update(final HttpServerRequest request) {

        final String id = extractParameter(request, NOTE_ID_PARAMETER);
        final String idWall = extractParameter(request, WALL_ID_PARAMETER);

        if (idWall == null || id == null) {
            return;
        }

        RequestUtils.bodyToJson(request, pathPrefix + "collaborativewallnote", new Handler<JsonObject>() {

            @Override
            public void handle(final JsonObject body) {
                UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
                    @Override
                    public void handle(UserInfos user) {

                        Long lastEdit = body.getJsonObject(NOTE_MODIFIED_ATTR).getLong(NOTE_MODIFIED_DATE_FIELD);

                        noteService.update(id, body, user, listAllNotesHandler(idWall, request));

                    }
                });
            }
        });
    }

    @ApiDoc("Allows to create a new note on a collaborativewall")
    public void delete(final HttpServerRequest request) {

        final String id = extractParameter(request, NOTE_ID_PARAMETER);
        final String idWall = extractParameter(request, WALL_ID_PARAMETER);

        if (idWall == null || id == null) {
            return;
        }

        final Long lastEdit = extractLongParameter(request, NOTE_LASTEDIT_PARAMETER);

        UserUtils.getUserInfos(eb, request, new Handler<UserInfos>() {
            @Override
            public void handle(UserInfos user) {
                noteService.delete(id, lastEdit, user, listAllNotesHandler(idWall, request));
            }
        });
    }

    @ApiDoc("Allows to create a new note on a collaborativewall")
    public void removeAllNotes(String idWall, Handler<Either<String, JsonObject>> callback) {
        noteService.removeAllNotes(idWall, callback);
    }

    @ApiDoc("Allows to create a new note on a collaborativewall")
    public void countNotes(JsonArray walls, Handler<Either<String, JsonArray>> callback) {
        noteService.countNotes(walls, callback);
    }


    private Handler<Either<String, JsonObject>> listAllNotesHandler(final String idWall, final HttpServerRequest request) {
        return new Handler<Either<String, JsonObject>>() {
            @Override
            public void handle(final Either<String, JsonObject> accessConcurrentResponse) {

                noteService.listAllNotes(idWall, new Handler<Either<String, JsonArray>>() {
                    @Override
                    public void handle(Either<String, JsonArray> allNotesResponse) {
                        if (accessConcurrentResponse.isRight()) {
                            //send back wall to front + status ok
                            renderJson(request, addStatus("ok", allNotesResponse));
                        } else {
                            //send back wall and message to front
                            renderJson(request, addStatus(accessConcurrentResponse.left().getValue(), allNotesResponse));
                        }
                    }
                });


            }
        };
    }

    private JsonObject addStatus(String status, Either<String, JsonArray> allNotesResponse) {

        JsonObject json = new JsonObject();
        if (allNotesResponse.isRight()) {
            json.put("status", status);
            json.put("wall", allNotesResponse.right().getValue());
        } else {
            json.put("status", allNotesResponse.left().getValue());
            json.putNull("wall");
        }
        return json;
    }



    public static String extractParameter(final HttpServerRequest request, final String parameterKey) {
        try {
            return request.params().get(parameterKey);
        } catch (Exception e) {
            log.error("Failed to extract parameter [ " + parameterKey + " ] : " + e.getMessage());
            Renders.badRequest(request, e.getMessage());
            return null;
        }
    }

    private Long extractLongParameter(final HttpServerRequest request, final String parameterKey) {
        try {
            return Long.parseLong(extractParameter(request, parameterKey));
        } catch (Exception e) {
            log.error("Failed to extract parameter [ " + parameterKey + " ] : " + e.getMessage());
            Renders.badRequest(request, e.getMessage());
            return null;
        }
    }

}
