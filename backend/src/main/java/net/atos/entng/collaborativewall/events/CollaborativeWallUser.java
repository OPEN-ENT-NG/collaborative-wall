package net.atos.entng.collaborativewall.events;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class CollaborativeWallUser {
  private final String id;
  private final String name;
  private final List<String> groupIds;

  @JsonCreator
  public CollaborativeWallUser(@JsonProperty("id") final String id,
                               @JsonProperty("name") final String name,
                               @JsonProperty("groupIds") final List<String> groupIds) {
    this.id = id;
    this.name = name;
    this.groupIds = groupIds;
  }

  public String getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public List<String> getGroupIds() {
    return groupIds;
  }
  
  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    CollaborativeWallUser that = (CollaborativeWallUser) o;

    if (id != null ? !id.equals(that.id) : that.id != null) return false;
    if (name != null ? !name.equals(that.name) : that.name != null) return false;
    return groupIds != null ? groupIds.equals(that.groupIds) : that.groupIds == null;
  }

  @Override
  public int hashCode() {
    int result = id != null ? id.hashCode() : 0;
    result = 31 * result + (name != null ? name.hashCode() : 0);
    result = 31 * result + (groupIds != null ? groupIds.hashCode() : 0);
    return result;
  }

}
