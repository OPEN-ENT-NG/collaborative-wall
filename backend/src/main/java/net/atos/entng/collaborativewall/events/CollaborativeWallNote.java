package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.*;
import fr.wseduc.mongodb.MongoDb;
import io.vertx.core.json.JsonObject;
import org.entcore.common.user.UserInfos;
import org.entcore.common.utils.DateUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.ParseException;
import java.util.*;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallNote {
    private static final Logger log = LoggerFactory.getLogger(CollaborativeWallNote.class);
    @JsonProperty("_id")
    private final String id;
    private final String content;
    private final JsonObject owner;
    private final JsonObject created;
    private final JsonObject modified;
    private final Long x;
    private final Long y;
    private final List<String> color;
    private final boolean isMediaVisible;
    private final String lastEdit;
    private final CollaborativeWallNoteMedia media;
    private final String idwall;

    private static final List<String> dates_to_adapt = new ArrayList<>();
    static {
        dates_to_adapt.add("created");
        dates_to_adapt.add("modified");
    }

    @JsonCreator
    public CollaborativeWallNote(@JsonProperty("_id") final String id,
                                 @JsonProperty("content") final String content,
                                 @JsonProperty("owner") final Map<String, Object> owner,
                                 @JsonProperty("x") final Long x,
                                 @JsonProperty("y") final Long y,
                                 @JsonProperty("color") final List<String> color,
                                 @JsonProperty("isMediaVisible") final boolean isMediaVisible,
                                 @JsonProperty("lastEdit") final String lastEdit,
                                 @JsonProperty("media") final Object media,
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
        this.isMediaVisible = isMediaVisible;
        this.lastEdit = lastEdit;
        this.idwall = idwall;
        // manage imported media as String
        if(media == null){
            this.media = null;
        }else if(media instanceof  CollaborativeWallNoteMedia){
            this.media = (CollaborativeWallNoteMedia)media;
        }else if (media instanceof String){
            this.media =  new CollaborativeWallNoteMedia(media.toString(), "", "", "", media.toString(), "");
        }else if(media instanceof Map){
            this.media = CollaborativeWallNoteMedia.fromJson(new JsonObject((Map<String, Object>) media));
        }else {
            throw new IllegalArgumentException("Invalid type for media: "+media);
        }
    }

    public CollaborativeWallNote(final String id, final CollaborativeWallNote other) {
        this(id, other.content,
                other.owner != null ? new HashMap<>(other.owner.getMap()) : new HashMap<>(),
                other.x,
                other.y,
                other.color != null ? new ArrayList<>(other.color) : new ArrayList<>(),
                other.isMediaVisible,
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
                other.isMediaVisible,
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
                other.isMediaVisible,
                other.lastEdit,
                other.media != null ? new CollaborativeWallNoteMedia(other.media) : null,
                other.idwall,
                previous.created != null ? new HashMap<>(previous.created.getMap()) : new HashMap<>(),
                new JsonObject().put("$date", modified).getMap());
    }

    /**
     * Handle dates format to be upserted in MongoDB
     * @param note Note to be upserted in MongoDB
     * @return A copy of this note ready to be inserted into MongoDB
     */
    public static JsonObject toMongoDb(JsonObject note) {
        final JsonObject copy = note.copy();
        for (String dateName : dates_to_adapt) {
            Object value = copy.getValue(dateName);
            long ts = -1;
            if(value instanceof Number) {
                ts = (long)value;
            } else if(value instanceof JsonObject) {
                Object dateValue = ((JsonObject) value).getValue("$date");
                if(dateValue instanceof Number) {
                    ts = (long)dateValue;
                }
            }
            if(ts > 0) {
                copy.put(dateName, new JsonObject().put("$date", DateUtils.formatUtcDateTime(new Date(ts))));
            }
        }
        return copy;
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

    public boolean getIsMediaVisible() {
        return isMediaVisible;
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
        return adaptDates(json).mapTo(CollaborativeWallNote.class);
    }

    private static JsonObject adaptDates(JsonObject json) {
        for (String dateName : dates_to_adapt) {
            Object value = json.getValue(dateName);
            long ts = -1;
            if(value instanceof Number) {
                ts = (long) value;
            } else if(value instanceof String) {
              try {
                ts = MongoDb.parseDate((String)value).getTime();
              } catch (ParseException e) {
                  log.error("Cannot adapt date " + dateName  + ": " + value, e);
              }
            } else if(value instanceof JsonObject) {
                Object dateValue = ((JsonObject) value).getValue("$date");
                if(dateValue instanceof String) {
                    ts = DateUtils.parseIsoDate((JsonObject) value).getTime();
                }
            }
            if(ts > 0) {
                json.put(dateName, new JsonObject().put("$date", ts));
            }
        }
        return json;
    }

    public JsonObject getCreated() {
        return created;
    }
}
