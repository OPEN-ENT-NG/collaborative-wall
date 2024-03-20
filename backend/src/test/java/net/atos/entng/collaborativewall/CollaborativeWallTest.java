package net.atos.entng.collaborativewall;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import net.atos.entng.collaborativewall.events.CollaborativeWallNote;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.ArrayList;

@RunWith(VertxUnitRunner.class)
public class CollaborativeWallTest {

    @Test
    public void shouldSerializeNote(TestContext context) {
        final CollaborativeWallNote note = new CollaborativeWallNote("ID", "CONTANT", new JsonObject().put("_id", "ID").getMap(), 10l, 10l, new ArrayList<>(), "LAS", "MEDIA", "WALLID");
        // parse
        final String toJson1 = note.toJson().toString();
        // parse then serialize
        final String toJson2 = CollaborativeWallNote.fromJson(note.toJson()).toJson().toString();
        context.assertEquals(toJson1, toJson2);
    }
}
