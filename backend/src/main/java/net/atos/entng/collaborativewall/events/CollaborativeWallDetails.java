package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallDetails {
  @JsonProperty("_id")
  private final String id;
  private final String name;
  private final String description;
  private final CollaborativeWallBackground background;
  private final String icon;
  private final Object shared;
  private final Object owner;

  @JsonCreator
  public CollaborativeWallDetails(@JsonProperty("_id") final String id,
                                  @JsonProperty("name") final String name,
                                  @JsonProperty("description") final String description,
                                  @JsonProperty("background") final Object background,
                                  @JsonProperty("icon") final String icon,
                                  @JsonProperty("shared") final Object shared,
                                  @JsonProperty("owner") final Object owner) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.icon = icon;
    this.shared = shared;
    this.owner = owner;
    // manage imported background as String
    if(background == null){
      // should not be null
      this.background = new CollaborativeWallBackground("", "");
    }else if(background instanceof  CollaborativeWallBackground){
      this.background = checkBackground((CollaborativeWallBackground)background);
    }else if (background instanceof String){
      this.background =  checkBackground(new CollaborativeWallBackground(background.toString(), ""));
    }else if(background instanceof Map){
      this.background = checkBackground(CollaborativeWallBackground.fromJson(new JsonObject((Map<String, Object>) background)));
    }else {
      throw new IllegalArgumentException("Invalid type for background: "+background);
    }
    // should not contains custom background
  }

  private static CollaborativeWallBackground checkBackground(final CollaborativeWallBackground background){
    if(background != null && background.getPath() != null && background.getPath().startsWith("/workspace/")){
      return  new CollaborativeWallBackground("", background.getColor());
    }else{
      return background;
    }
  }
  public CollaborativeWallDetails(final String id, final CollaborativeWallDetails other) {
    this(id, other.name, other.description, other.background, other.icon, other.shared, other.owner);
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

  public CollaborativeWallBackground getBackground() {
    return background;
  }

  public String getIcon() {
    return icon;
  }

  public Object getShared() {
    return shared;
  }

  public Object getOwner() {
    return owner;
  }

  public JsonObject toJson(){
    return JsonObject.mapFrom(this);
  }

  public static CollaborativeWallDetails fromJson(final JsonObject json){
    return json.mapTo(CollaborativeWallDetails.class);
  }
}
