package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallNoteMedia {
  private final String id;
  private final String name;
  private final String application;
  private final String type;
  private final String url;
  private final String targetUrl;

  @JsonCreator
  public CollaborativeWallNoteMedia(@JsonProperty("id") final String id,
                                    @JsonProperty("name") final String name,
                                    @JsonProperty("application") final String application,
                                    @JsonProperty("type") final String type,
                                    @JsonProperty("url") final String url,
                                    @JsonProperty("targetUrl") final String targetUrl) {
    this.id = id;
    this.name = name;
    this.application = application;
    this.type = type;
    this.url = url;
    this.targetUrl = targetUrl;
  }

  public CollaborativeWallNoteMedia(CollaborativeWallNoteMedia other) {
    this(other.id, other.name, other.application, other.type, other.url, other.targetUrl);
  }
  public String getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public String getApplication() {
    return application;
  }

  public String getType() {
    return type;
  }

  public String getUrl() {
    return url;
  }

  public String getTargetUrl() {
    return targetUrl;
  }

  public JsonObject toJson(){
    return JsonObject.mapFrom(this);
  }

  public static CollaborativeWallNoteMedia fromJson(final JsonObject json){
    return json.mapTo(CollaborativeWallNoteMedia.class);
  }
}
