package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallDetails {
  @JsonProperty("_id")
  private final String id;
  private final String name;
  private final String description;
  private final JsonObject background;
  private final String icon;

  @JsonCreator
  public CollaborativeWallDetails(@JsonProperty("_id") final String id,
                                  @JsonProperty("name") final String name,
                                  @JsonProperty("description") final String description,
                                  @JsonProperty("background") final Map<String, Object> background,
                                  @JsonProperty("icon") final String icon) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.background = new JsonObject(background);
    this.icon = icon;
  }
  public CollaborativeWallDetails(final String id, final CollaborativeWallDetails other) {
    this(id, other.name, other.description, new HashMap<>(other.background.getMap()), other.icon);
  }


  public String getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getDescription() {
    return description;
  }

  public JsonObject getBackground() {
    return background;
  }

  public String getIcon() {
    return icon;
  }

  public JsonObject toJson(){
    return JsonObject.mapFrom(this);
  }

  public static CollaborativeWallDetails fromJson(final JsonObject json){
    return json.mapTo(CollaborativeWallDetails.class);
  }
}
