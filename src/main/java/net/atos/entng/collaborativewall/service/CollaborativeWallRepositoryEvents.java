package net.atos.entng.collaborativewall.service;

import org.entcore.common.service.impl.MongoDbRepositoryEvents;
import org.vertx.java.core.Handler;
import org.vertx.java.core.json.JsonArray;

import fr.wseduc.mongodb.MongoDb;

public class CollaborativeWallRepositoryEvents extends MongoDbRepositoryEvents {

    private final MongoDb mongo = MongoDb.getInstance();

    public CollaborativeWallRepositoryEvents() {
        super("net-atos-entng-collaborativewall-controllers-CollaborativeWallController|delete");
    }

    @Override
    public void exportResources(String exportId, String userId,
            JsonArray groups, String exportPath, String locale, String host, final Handler<Boolean> handler) {
        // TODO
        log.warn("Method exportResources is not implemented in CollaborativeWallRepositoryEvents");
    }

}
