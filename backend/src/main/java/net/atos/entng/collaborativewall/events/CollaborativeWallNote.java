package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallNote {
  private final String id;
  private final String content;
  private final String owner;
  private final Long x;
  private final Long y;
  private final List<String> color;
  private final String lastEdit;
  private final String media;
  private final String idwall;
  @JsonCreator
  public CollaborativeWallNote(@JsonProperty("_id") final String id,
                               @JsonProperty("content") final String content,
                               @JsonProperty("owner") final String owner,
                               @JsonProperty("x") final Long x,
                               @JsonProperty("y") final Long y,
                               @JsonProperty("color") final List<String> color,
                               @JsonProperty("lastEdit") final String lastEdit,
                               @JsonProperty("media") final String media,
                               @JsonProperty("idwall") final String idwall) {
    this.id = id;
    this.content = content;
    this.owner = owner;
    this.x = x;
    this.y = y;
    this.color = color;
    this.lastEdit = lastEdit;
    this.media = media;
    this.idwall = idwall;
  }

  public String getId() {
    return id;
  }

  public String getContent() {
    return content;
  }

  public String getOwner() {
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

  public String getMedia() {
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
