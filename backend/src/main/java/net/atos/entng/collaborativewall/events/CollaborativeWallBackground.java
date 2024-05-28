package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallBackground {
  private final String path;
  private final String color;

  @JsonCreator
  public CollaborativeWallBackground(@JsonProperty("path") final String path,
                                     @JsonProperty("color") final String color) {
    this.path = path;
    this.color = color;
  }

  public String getPath() {
    return path;
  }

  public String getColor() {
    return color;
  }

  public static CollaborativeWallBackground fromJson(final JsonObject json){
    return json.mapTo(CollaborativeWallBackground.class);
  }
}
