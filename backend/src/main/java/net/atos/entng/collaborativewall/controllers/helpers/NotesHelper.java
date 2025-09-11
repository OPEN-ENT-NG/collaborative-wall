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
import org.entcore.common.events.EventHelper;
import org.entcore.common.http.response.DefaultResponseHandler;
import org.entcore.common.user.UserInfos;
import org.entcore.common.user.UserUtils;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class NotesHelper extends ControllerHelper {


    public static final String WALL_ID_PARAMETER = "id";
    public static final String NOTE_ID_PARAMETER = "idnote";
    public static final String NOTE_MODIFIED_ATTR = "modified";
    public static final String NOTE_MODIFIED_DATE_FIELD = "$date";
    public static final String NOTE_LASTEDIT_PARAMETER = "lastEdit";
    public static final String NOTE_Z_INDEX = "zIndex";
    private final NoteService noteService;
    private final EventHelper eventHelper;

    public NotesHelper(final NoteService noteService, final EventHelper eventHelper) {
        super();
        this.noteService = noteService;
        this.eventHelper = eventHelper;
    }

    public void listAllNotes(HttpServerRequest request) {
        final String idWall = extractParameter(request, WALL_ID_PARAMETER);
        if (idWall == null) {
            return;
        }

        noteService.listAllNotes(idWall, listAllNotesHandler(request));
    }

    //Transform the listAllNotes response to add a z index for each note based on modified date
    private Handler<Either<String, JsonArray>> listAllNotesHandler(final HttpServerRequest request) {
        return notesResponse -> {
                if(notesResponse.isRight()) {
                    List<JsonObject> values = new ArrayList<>();
                    JsonArray notes = notesResponse.right().getValue();
                    int nNotes = notes.size();
                    for(int i = 0; i < nNotes; i++){
                        values.add(notes.getJsonObject(i));
                    }
                    //Sort by modified date
                    try {
                        values.sort(Comparator.comparing(o ->
                                o.getJsonObject(NOTE_MODIFIED_ATTR).getString(NOTE_MODIFIED_DATE_FIELD)
                        ));
                    } catch (Exception e) {
                        log.error("An error occurred while sorting wall notes by modified date: ", e);
                    }
                    //Add z-index to notes based on previous ordering
                    JsonArray res = new JsonArray(
                            IntStream.range(0, nNotes)
                                    .mapToObj( i -> values.get(i).put(NOTE_Z_INDEX, i))
                                    .collect(Collectors.toList())
                    );
                    renderJson(request, res);
                }
                else {
                    JsonObject error = (new JsonObject()).put("error", notesResponse.left().getValue());
                    Renders.renderJson(request, error, 400);
                }
        };
    }

    /**
     * Get a note.
     */
    public void get(final HttpServerRequest request) {
        final String id = extractParameter(request, NOTE_ID_PARAMETER);
        final String idWall = extractParameter(request, WALL_ID_PARAMETER);

        if (idWall == null || id == null) {
            return;
        }

        noteService.get(id, DefaultResponseHandler.defaultResponseHandler(request));
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
                        noteService.create(body, user, createHandler(idWall, body, request));
                    }
                });
            }
        });
    }

    private Handler<Either<String, JsonObject>> createHandler(final String idWall, final JsonObject body, final HttpServerRequest request) {
        return accessConcurrentResponse -> {
            noteService.listAllNotes(idWall, allNotesResponse -> {
                if (accessConcurrentResponse.isRight()) {
                    //send back wall to front + status ok
                    if (allNotesResponse.isRight()) {
                        final String noteId = accessConcurrentResponse.right().getValue().getString("_id");
                        final JsonArray allNotes = allNotesResponse.right().getValue();
                        // Add the note manually in case the change is not replicated yet on mongo slave
                        for(Iterator<Object> iterator = allNotes.iterator(); iterator.hasNext();) {
                            final Object next = iterator.next();
                            if (noteId.equals(((JsonObject)(next)).getString("_id"))) {
                                iterator.remove();
                                break;
                            }
                        }
                        body.put("_id", noteId);
                        allNotes.add(body);
                    }
                    this.eventHelper.onCreateResource(request, "wall_note");
                    renderJson(request, addStatus("ok", allNotesResponse));
                } else {
                    //send back wall and message to front
                    renderJson(request, addStatus(accessConcurrentResponse.left().getValue(), allNotesResponse));
                }
            });
        };
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
                        noteService.update(id, body, user, updateHandler(id, body, request));
                    }
                });
            }
        });
    }

    private Handler<Either<String, JsonObject>> updateHandler(final String noteId,
                                                              final JsonObject body, final HttpServerRequest request) {
        return accessConcurrentResponse -> {
            noteService.get(noteId, noteResponse -> {
               if (accessConcurrentResponse.isRight()) {
                   if (noteResponse.isRight()) {
                       final JsonObject note = noteResponse.right().getValue();
                       // Update the note manually in case the change is not replicated yet on mongo slave
                       if (noteId.equals(note.getString("_id"))) {
                           for (String field : body.fieldNames()) {
                               note.put(field, body.getValue(field));
                               note.put("modified", accessConcurrentResponse.right().getValue());
                           }
                       }
                       // render Json response with status and note
                       renderJson(request,  new JsonObject().put("status", "ok").put("note", noteResponse.right().getValue()));
                   } else {
                       renderJson(request, new JsonObject().put("status", noteResponse.left().getValue()).putNull("note"));
                   }
               } else {
                   // render Json response with status and note
                   if (noteResponse.isRight()) {
                       renderJson(request, new JsonObject().put("status", accessConcurrentResponse.left().getValue()).put("note", noteResponse.right().getValue()));
                   } else {
                       renderJson(request, new JsonObject().put("status", noteResponse.left().getValue()).putNull("note"));
                   }
               }
            });
        };
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
                noteService.delete(id, lastEdit, user, deleteHandler(idWall, id, request));
            }
        });
    }


    private Handler<Either<String, JsonObject>> deleteHandler(final String idWall, final String noteId,
                                                              final HttpServerRequest request) {
        return accessConcurrentResponse -> {
            noteService.listAllNotes(idWall, allNotesResponse -> {
                if (accessConcurrentResponse.isRight()) {
                    //send back wall to front + status ok
                    if (allNotesResponse.isRight()) {
                        final JsonArray allNotes = allNotesResponse.right().getValue();
                        for(Iterator<Object> iterator = allNotes.iterator(); iterator.hasNext();) {
                            final Object next = iterator.next();
                            // Delete the note manually in case the change is not replicated yet on mongo slave
                            if (noteId.equals(((JsonObject)(next)).getString("_id"))) {
                                iterator.remove();
                                break;
                            }
                        }
                    }
                    renderJson(request, addStatus("ok", allNotesResponse));
                } else {
                    //send back wall and message to front
                    renderJson(request, addStatus(accessConcurrentResponse.left().getValue(), allNotesResponse));
                }
            });
        };
    }

    @ApiDoc("Allows to create a new note on a collaborativewall")
    public void removeAllNotes(String idWall, Handler<Either<String, JsonObject>> callback) {
        noteService.removeAllNotes(idWall, callback);
    }

    @ApiDoc("Allows to create a new note on a collaborativewall")
    public void countNotes(JsonArray walls, Handler<Either<String, JsonArray>> callback) {
        noteService.countNotes(walls, callback);
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
