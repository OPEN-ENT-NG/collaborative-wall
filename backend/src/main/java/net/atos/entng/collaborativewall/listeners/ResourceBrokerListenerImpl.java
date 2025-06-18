package net.atos.entng.collaborativewall.listeners;

import io.vertx.core.json.JsonObject;
import org.entcore.broker.api.dto.resources.ResourceInfoDTO;
import org.entcore.broker.proxy.ResourceBrokerListener;
import org.entcore.common.resources.MongoResourceBrokerListenerImpl;

import java.util.Date;

/**
 * Implementation of ResourceBrokerListener for the CollaborativeWall module.
 * Retrieves resource information from the collaborativewall collection.
 * Implements ResourceBrokerListener to detect Broker annotations.
 */
public class ResourceBrokerListenerImpl extends MongoResourceBrokerListenerImpl implements ResourceBrokerListener {

    /**
     * Name of the MongoDB collection containing collaborative walls data
     */
    private static final String COLLABORATIVEWALL_COLLECTION = "collaborativewall";

    /**
     * Create a new MongoDB implementation of ResourceBrokerListener for collaborative walls.
     */
    public ResourceBrokerListenerImpl() {
        super(COLLABORATIVEWALL_COLLECTION);
    }
    
    /**
     * Convert MongoDB collaborative wall document to ResourceInfoDTO.
     * Overrides parent method to match the specific document structure in collaborativewall.
     *
     * @param resource The MongoDB document from collaborativewall collection
     * @return ResourceInfoDTO with extracted information
     */
    @Override
    protected ResourceInfoDTO convertToResourceInfoDTO(JsonObject resource) {
        if (resource == null) {
            return null;
        }
        
        try {
            // Extract basic information
            final String id = resource.getString("_id");
            final String title = resource.getString("name", "");
            
            // Use description field if it exists, otherwise empty string
            final String description = resource.getString("description", "");
            
            // Get thumbnail from background.path if available
            String thumbnail = "";
            final JsonObject background = resource.getJsonObject("background");
            if (background != null && background.getString("path") != null) {
                thumbnail = background.getString("path");
            }
            
            // Extract owner information
            final JsonObject owner = resource.getJsonObject("owner", new JsonObject());
            final String authorId = owner.getString("userId", "");
            final String authorName = owner.getString("displayName", "");
            
            // Handle creation and modification dates
            Date creationDate = this.parseDate(resource.getValue("created", System.currentTimeMillis()));
            Date modificationDate = this.parseDate(resource.getValue("modified", System.currentTimeMillis()));
            
            return new ResourceInfoDTO(
                id,
                title,
                description,
                thumbnail,
                authorName,
                authorId,
                creationDate,
                modificationDate
            );
        } catch (Exception e) {
            log.error("Error converting CollaborativeWall document to ResourceInfoDTO", e);
            return null;
        }
    }
}