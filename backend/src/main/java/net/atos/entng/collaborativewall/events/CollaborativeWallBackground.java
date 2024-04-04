package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.*;
import io.vertx.core.json.JsonObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
}
