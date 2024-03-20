package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.*;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import io.vertx.core.json.JsonObject;

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
  private final Long x;
  private final Long y;
  private final List<String> color;
  private final String lastEdit;
  private final JsonObject media;
  private final String idwall;

  @JsonCreator
  public CollaborativeWallNote(@JsonProperty("_id") final String id,
                               @JsonProperty("content") final String content,
                               @JsonProperty("owner") final Map<String, Object> owner,
                               @JsonProperty("x") final Long x,
                               @JsonProperty("y") final Long y,
                               @JsonProperty("color") final List<String> color,
                               @JsonProperty("lastEdit") final String lastEdit,
                               @JsonProperty("media") final Map<String, Object> media,
                               @JsonProperty("idwall") final String idwall) {
    this.id = id;
    this.content = content;
    this.owner = new JsonObject(owner);
    this.x = x;
    this.y = y;
    this.color = color;
    this.lastEdit = lastEdit;
    this.media = new JsonObject(media);
    this.idwall = idwall;
  }

  public CollaborativeWallNote(final String id, final CollaborativeWallNote other) {
    this(id, other.content, new HashMap<>(other.owner.getMap()), other.x, other.y, new ArrayList<>(other.color), other.lastEdit, new HashMap<>(other.media.getMap()), other.idwall);
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

  public JsonObject getMedia() {
    return media;
  }

  public String getIdwall() {
    return idwall;
  }

  public JsonObject toJson(){
    return JsonObject.mapFrom(this);
  }

  public static CollaborativeWallNote fromJson(final JsonObject json){
    return json.mapTo(CollaborativeWallNote.class);
  }
}
