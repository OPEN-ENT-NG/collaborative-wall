package net.atos.entng.collaborativewall.service.impl;

import fr.wseduc.webutils.security.SecuredAction;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonArray;
import io.vertx.core.json.JsonObject;
import net.atos.entng.collaborativewall.events.CollaborativeWallDetails;
import net.atos.entng.collaborativewall.events.CollaborativeWallNote;
import net.atos.entng.collaborativewall.service.CollaborativeWallService;
import net.atos.entng.collaborativewall.service.NoteService;
import org.apache.commons.lang3.StringUtils;
import org.entcore.common.service.CrudService;
import org.entcore.common.share.ShareModel;
import org.entcore.common.share.ShareRoles;
import org.entcore.common.user.UserInfos;

import java.util.*;

public class MongoDbCollaborativeWallService implements CollaborativeWallService {

    private final CrudService crudService;

    private final NoteService noteService;
    private final Map<String, SecuredAction> securedActions;

    public MongoDbCollaborativeWallService(final CrudService crudService,
                                           final NoteService noteService,
                                           final Map<String, SecuredAction> securedActions) {
        this.crudService = crudService;
        this.noteService = noteService;
        this.securedActions = securedActions;
    }

    @Override
    public Future<JsonObject> getWall(final String wallId) {
        final Promise<JsonObject> promise = Promise.promise();
        this.crudService.retrieve(wallId, e -> {
            if (e.isLeft()) {
                promise.fail(e.left().getValue());
            } else {
                promise.complete(e.right().getValue());
            }
        });
        return promise.future();
    }

    @Override
    public Future<List<JsonObject>> getNotesOfWall(final String wallId) {
        final Promise<List<JsonObject>> promise = Promise.promise();
        this.noteService.listAllNotes(wallId, e -> {
            if (e.isLeft()) {
                promise.fail(e.left().getValue());
            } else {
                promise.complete(e.right().getValue().getList());
            }
        });
        return promise.future();
    }

    @Override
    public Future<CollaborativeWallDetails> updateWall(final String wallId, final CollaborativeWallDetails wall, final UserInfos user) {
        final Promise<CollaborativeWallDetails> promise = Promise.promise();
        this.crudService.update(wallId, wall.toJson(), result -> {
            if (result.isRight()) {
                promise.complete(new CollaborativeWallDetails(wallId, wall));
            } else {
                promise.fail(result.left().getValue());
            }
        });
        return promise.future();
    }

    @Override
    public Future<Void> deleteWall(final String wallId, final UserInfos user) {
        final Promise<Void> promise = Promise.promise();
        this.crudService.delete(wallId, result -> {
            if (result.isRight()) {
                promise.complete();
            } else {
                promise.fail(result.left().getValue());
            }
        });
        return promise.future();
    }

    @Override
    public Future<CollaborativeNoteDiff> upsertNote(final String wallId, final CollaborativeWallNote note, final UserInfos user, final boolean checkConcurency) {
        final Promise<CollaborativeNoteDiff> promise = Promise.promise();
        final String id = note.getId();
        if (StringUtils.isBlank(id)) {
            // create note
            final CollaborativeWallNote safeNote = new CollaborativeWallNote(note, user, System.currentTimeMillis());
            this.noteService.create(safeNote.toJson(), user, result -> {
                if (result.isRight()) {
                    final CollaborativeWallNote newNote = new CollaborativeWallNote(result.right().getValue().getString("_id"), safeNote);
                    final CollaborativeNoteDiff diff = new CollaborativeNoteDiff(null, newNote);
                    promise.complete(diff);
                } else {
                    promise.fail(result.left().getValue());
                }
            });
        } else {
            // update note
            this.noteService.get(id, previous -> {
                if (previous.isRight()) {
                    final CollaborativeWallNote previousNote = CollaborativeWallNote.fromJson(previous.right().getValue());
                    final CollaborativeWallNote safeNote = new CollaborativeWallNote(previousNote, note, checkConcurency?previousNote.getModified().getLong("$date"): System.currentTimeMillis());
                    this.noteService.update(id, safeNote.toJson(), user, checkConcurency, result -> {
                        if (result.isRight()) {
                            final CollaborativeNoteDiff diff = new CollaborativeNoteDiff(previousNote, safeNote);
                            promise.complete(diff);
                        } else {
                            promise.fail(result.left().getValue());
                        }
                    });
                } else {
                    promise.fail(previous.left().getValue());
                }

            });
        }
        return promise.future();
    }

    @Override
    public Future<CollaborativeWallNote> patchNote(final String wallId, final PatchKind kind, final CollaborativeWallNote note, final UserInfos user, final boolean checkConcurency) {
        final Promise<CollaborativeWallNote> promise = Promise.promise();
        // get and check id
        final String id = note.getId();
        if (StringUtils.isBlank(id)) {
            promise.fail("note.id.missing");
            return promise.future();
        }
        // get the last version of the note
        this.noteService.get(id, resGet -> {
            if (resGet.isLeft()) {
                promise.fail(resGet.left().getValue());
            } else {
                // patch note
                final JsonObject patched = resGet.right().getValue();
                switch (kind) {
                    case Text: {
                        patched.put("content", note.getContent());
                        break;
                    }
                    case Image: {
                        if (note.getMedia() != null) {
                            patched.put("media", note.getMedia().toJson());
                        } else {
                            patched.put("media", new JsonObject());
                        }
                        break;
                    }
                    case Position: {
                        patched.put("x", note.getX());
                        patched.put("y", note.getY());
                        break;
                    }
                }
                // upsert patched note
                this.noteService.update(id, patched, user, checkConcurency, resUpdate -> {
                    if (resUpdate.isLeft()) {
                        promise.fail(resUpdate.left().getValue());
                    } else {
                        promise.complete(CollaborativeWallNote.fromJson(patched));
                    }
                });
            }
        });
        return promise.future();
    }

    @Override
    public Future<CollaborativeWallNote> deleteNote(final String wallId, final String noteId, final UserInfos user, final boolean checkConcurency) {
        final Promise<CollaborativeWallNote> promise = Promise.promise();
        // get last version of the note
        this.noteService.get(noteId, resGet -> {
            if (resGet.isLeft()) {
                promise.fail(resGet.left().getValue());
            } else {
                // skip concurrency
                final Long modified = resGet.right().getValue().getJsonObject(MongoDbNoteService.NOTES_FIELD_MODIFIED, new JsonObject()).getLong(MongoDbNoteService.NOTES_MODIFIED_ATTR_DATE, 0l);
                // delete note
                this.noteService.delete(noteId, modified, user, checkConcurency, result -> {
                    if (result.isRight()) {
                        promise.complete(CollaborativeWallNote.fromJson(resGet.right().getValue()));
                    } else {
                        promise.fail(result.left().getValue());
                    }
                });
            }
        });
        return promise.future();
    }

    @Override
    public Future<Boolean> canAccess(final String wallId, final UserInfos user) {
        // get wall
        return this.getWall(wallId).map(wall -> {
            // transformed shared into normalized shares
            final Optional<String> ownerId = Optional.ofNullable(wall.getJsonObject("owner", new JsonObject()).getString("userId"));
            final JsonArray shared = wall.getJsonArray("shared", new JsonArray());
            return new ShareModel(shared, this.securedActions, ownerId);
        }).map(shared -> {
            // check creator right
            if (shared.getCreatorId().isPresent() && shared.getCreatorId().get().equals(user.getUserId())) {
                return true;
            }
            // check user rights
            final Set<ShareRoles> userRights = shared.getNormalizedRightsByUser().getOrDefault(user.getUserId(), Collections.EMPTY_SET);
            if (!userRights.isEmpty()) {
                return true;
            }
            // check group rights
            for (final String groupId : user.getGroupsIds()) {
                final Set<ShareRoles> groupRights = shared.getNormalizedRightsByGroup().getOrDefault(groupId, Collections.EMPTY_SET);
                if (!groupRights.isEmpty()) {
                    return true;
                }
            }
            return false;
        });
    }
}
