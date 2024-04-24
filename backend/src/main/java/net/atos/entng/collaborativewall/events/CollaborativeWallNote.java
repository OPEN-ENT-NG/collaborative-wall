package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.*;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallNote {
    @JsonProperty("_id")
    private final String id;
    private final String content;
    private final JsonObject owner;
    private final JsonObject created;
    private final JsonObject modified;
    private final Long x;
    private final Long y;
    private final List<String> color;
    private final String lastEdit;
    private final CollaborativeWallNoteMedia media;
    private final String idwall;

    @JsonCreator
    public CollaborativeWallNote(@JsonProperty("_id") final String id,
                                 @JsonProperty("content") final String content,
                                 @JsonProperty("owner") final Map<String, Object> owner,
                                 @JsonProperty("x") final Long x,
                                 @JsonProperty("y") final Long y,
                                 @JsonProperty("color") final List<String> color,
                                 @JsonProperty("lastEdit") final String lastEdit,
                                 @JsonProperty("media") final CollaborativeWallNoteMedia media,
                                 @JsonProperty("idwall") final String idwall,
                                 @JsonProperty("created") final Map<String, Object> created,
                                 @JsonProperty("modified") final Map<String, Object> modified) {
        this.id = id;
        this.content = content;
        this.owner = owner != null ? new JsonObject(owner) : null;
        this.modified = modified != null ? new JsonObject(modified) : null;
        this.created = created != null ? new JsonObject(created) : null;
        this.x = x;
        this.y = y;
        this.color = color;
        this.lastEdit = lastEdit;
        this.media = media;
        this.idwall = idwall;
    }

    public CollaborativeWallNote(final String id, final CollaborativeWallNote other) {
        this(id, other.content,
                other.owner != null ? new HashMap<>(other.owner.getMap()) : new HashMap<>(),
                other.x,
                other.y,
                other.color != null ? new ArrayList<>(other.color) : new ArrayList<>(),
                other.lastEdit,
                other.media != null ? new CollaborativeWallNoteMedia(other.media) : null,
                other.idwall,
                other.created != null ? new HashMap<>(other.created.getMap()) : new HashMap<>(),
                other.modified != null ? new HashMap<>(other.modified.getMap()) : new HashMap<>());
    }

    public CollaborativeWallNote(final CollaborativeWallNote other, final UserInfos user, final long created) {
        this(other.getId(), other.content,
                new JsonObject().put("userId", user.getUserId()).put("displayName", user.getUsername()).getMap(),
                other.x,
                other.y,
                other.color != null ? new ArrayList<>(other.color) : new ArrayList<>(),
                other.lastEdit,
                other.media != null ? new CollaborativeWallNoteMedia(other.media) : null,
                other.idwall,
                new JsonObject().put("$date", created).getMap(),
                new JsonObject().put("$date", created).getMap());
    }

    public CollaborativeWallNote(final CollaborativeWallNote previous, final CollaborativeWallNote other, final long modified) {
        this(previous.getId(), other.content,
                previous.owner != null ? new HashMap<>(previous.owner.getMap()) : new HashMap<>(),
                other.x,
                other.y,
                other.color != null ? new ArrayList<>(other.color) : new ArrayList<>(),
                other.lastEdit,
                other.media != null ? new CollaborativeWallNoteMedia(other.media) : null,
                other.idwall,
                previous.created != null ? new HashMap<>(previous.created.getMap()) : new HashMap<>(),
                new JsonObject().put("$date", modified).getMap());
    }

    public String getId() {
        return id;
    }

    @JsonAnySetter
    public void set(String name, Object value) {
        owner.getMap().put(name, value);
    }

    public String getContent() {
        return content;
    }

    public JsonObject getOwner() {
        return owner;
    }

    public Long getX() {
        return x;
    }

    public Long getY() {
        return y;
    }

    public List<String> getColor() {
        return color;
    }

    public String getLastEdit() {
        return lastEdit;
    }

    public CollaborativeWallNoteMedia getMedia() {
        return media;
    }

    public JsonObject getModified() {
        return modified;
    }

    public String getIdwall() {
        return idwall;
    }

    public JsonObject toJson(boolean preserveNullValues) {
        final JsonObject json = JsonObject.mapFrom(this);
        if(preserveNullValues){
            if(this.media == null){
                json.putNull("media");
            }
        }
        return json;
    }

    public static CollaborativeWallNote fromJson(final JsonObject json) {
        return json.mapTo(CollaborativeWallNote.class);
    }

    public JsonObject getCreated() {
        return created;
    }
}
