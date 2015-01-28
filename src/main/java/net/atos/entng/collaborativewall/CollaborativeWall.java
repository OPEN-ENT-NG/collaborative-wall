package net.atos.entng.collaborativewall;

import net.atos.entng.collaborativewall.controllers.CollaborativeWallController;

import org.entcore.common.http.BaseServer;
import org.entcore.common.http.filter.ShareAndOwner;
import org.entcore.common.mongodb.MongoDbConf;

/**
 * Server to manage collaborative walls. This class is the entry point of the Vert.x module.
 * @author Atos
 */
public class CollaborativeWall extends BaseServer {

    /**
     * Constant to define the MongoDB collection to use with this module.
     */
    public static final String COLLABORATIVE_WALL_COLLECTION = "collaborativewall";

    /**
     * Entry point of the Vert.x module
     */
    @Override
    public void start() {
        super.start();

        MongoDbConf conf = MongoDbConf.getInstance();
        conf.setCollection(COLLABORATIVE_WALL_COLLECTION);
        conf.setResourceIdLabel("id");

        setDefaultResourceFilter(new ShareAndOwner());
        addController(new CollaborativeWallController(COLLABORATIVE_WALL_COLLECTION));
    }

}
