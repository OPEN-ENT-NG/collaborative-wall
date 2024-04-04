package net.atos.entng.collaborativewall;

import io.vertx.core.json.JsonObject;
import io.vertx.ext.unit.TestContext;
import io.vertx.ext.unit.junit.VertxUnitRunner;
import net.atos.entng.collaborativewall.events.CollaborativeWallBackground;
import net.atos.entng.collaborativewall.events.CollaborativeWallDetails;
import net.atos.entng.collaborativewall.events.CollaborativeWallNote;
import net.atos.entng.collaborativewall.events.CollaborativeWallNoteMedia;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.util.ArrayList;

@RunWith(VertxUnitRunner.class)
public class CollaborativeWallTest {

    @Test
    public void shouldSerializeNote(TestContext context) {
        final CollaborativeWallNote note = new CollaborativeWallNote("ID", "CONTANT", new JsonObject().put("_id", "ID").getMap(), 10l, 10l, new ArrayList<>(), "LAS", new CollaborativeWallNoteMedia("ID", "NAME", "APP", "TYPE", "URL"), "WALLID");
        // parse
        final String toJson1 = note.toJson().toString();
        // parse then serialize
        final String toJson2 = CollaborativeWallNote.fromJson(note.toJson()).toJson().toString();
        context.assertEquals(toJson1, toJson2);
    }

    @Test
    public void shouldSerializeWall(TestContext context) {
        final CollaborativeWallDetails note = new CollaborativeWallDetails("ID", "NAME", "DESCRIPTION", new CollaborativeWallBackground("path/to/image", "RED"), "ICON");
        // parse
        final String toJson1 = note.toJson().toString();
        // parse then serialize
        final String toJson2 = CollaborativeWallDetails.fromJson(note.toJson()).toJson().toString();
        context.assertEquals(toJson1, toJson2);
    }
}
