package net.atos.entng.collaborativewall.explorer;

import fr.wseduc.mongodb.MongoQueryBuilder;
import io.vertx.core.Future;
import io.vertx.core.Promise;
import io.vertx.core.json.JsonObject;
import io.vertx.core.logging.Logger;
import io.vertx.core.logging.LoggerFactory;
import io.vertx.ext.mongo.MongoClient;
import io.vertx.ext.mongo.MongoClientDeleteResult;
import net.atos.entng.collaborativewall.CollaborativeWall;
import org.entcore.common.explorer.ExplorerMessage;
import org.entcore.common.explorer.impl.ExplorerSubResourceMongo;
import org.entcore.common.user.UserInfos;

import java.util.Collection;
import java.util.Optional;

import static com.mongodb.client.model.Filters.in;

public class NoteExplorerPlugin extends ExplorerSubResourceMongo {
    public static final String COLLECTION = CollaborativeWall.COLLABORATIVE_WALL_NOTES_COLLECTION;
    static Logger log = LoggerFactory.getLogger(NoteExplorerPlugin.class);

    public NoteExplorerPlugin(final WallExplorerPlugin plugin) {
        super(plugin, plugin.getMongoClient());
    }

    @Override
    protected Optional<UserInfos> getCreatorForModel(final JsonObject json) {
        if(!json.containsKey("owner") || !json.getJsonObject("owner").containsKey("userId")){
            return Optional.empty();
        }
        final JsonObject author = json.getJsonObject("owner");
        final UserInfos user = new UserInfos();
        user.setUserId( author.getString("userId"));
        user.setUsername(author.getString("displayName"));
        return Optional.of(user);
    }

    @Override
    public Future<Void> onDeleteParent(final Collection<String> ids) {
        if(ids.isEmpty()) {
            return Future.succeededFuture();
        }
        final MongoClient mongo = ((WallExplorerPlugin)super.parent).getMongoClient();
        final JsonObject filter = MongoQueryBuilder.build(in("idwall", ids));
        final Promise<MongoClientDeleteResult> promise = Promise.promise();
        log.info("Deleting notes related to deleted wall. Number of walls="+ids.size());
        mongo.removeDocuments(COLLECTION, filter, promise);
        return promise.future().map(e->{
            log.info("Deleted notes related to deleted wall. Number of walls="+e.getRemovedCount());
            return null;
        });
    }

    @Override
    protected String getCreatedAtColumn() {
        return "created";
    }

    @Override
    public String getEntityType() {
        return CollaborativeWall.NOTE_TYPE;
    }

    @Override
    protected String getParentId(JsonObject jsonObject) {
        return jsonObject.getString("idwall");
    }


    @Override
    protected Future<ExplorerMessage> doToMessage(final ExplorerMessage message, final JsonObject source) {
        final String id = source.getString("_id");
        message.withVersion(System.currentTimeMillis());
        message.withSubResourceHtml(id, source.getString("content",""), source.getLong("version", 0L));
        return Future.succeededFuture(message);
    }

    @Override
    protected String getCollectionName() { return COLLECTION; }

    protected String getParentColumn() {
        return "idwall";
    }

}
