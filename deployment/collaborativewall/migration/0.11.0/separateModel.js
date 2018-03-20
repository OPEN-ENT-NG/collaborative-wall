db.getCollection('collaborativewall.notes').remove({});
db.getCollection('collaborativewall').find({}).forEach(
    function(collaborativeWall){

        //move notes into a new separated collection
        if (collaborativeWall.hasOwnProperty("notes")) {
            var notes = collaborativeWall.notes;

            var now = Date.now();

            // move all notes into a new collection, set idwall as ref to original wall
            for (var i = 0; i < notes.length; i++) {
                var note = notes[i];

                note.idwall = collaborativeWall._id;
                note._id = ObjectId().str;

                // use correct property for user displayName : owner is automatically add to JSON note object by MongoDbCrudService
                note.owner.displayName = note.owner.username;
                delete note.owner.username;

                //transform zindex to lastEdit field
                note.lastEdit = new Date(now + note.zindex * 60000).toISOString();
                delete note.zindex;
                db.getCollection('collaborativewall.notes').insert(notes[i]);
            }

            // remove all notes on that wall
            db.getCollection('collaborativewall').update({"_id": collaborativeWall._id}, {$unset: {notes: ""}});
        }

        //give new shared rights to the wall
        if (collaborativeWall.hasOwnProperty("shared")){
            var shareds = collaborativeWall.shared;

            for (var i = 0; i < shareds.length; i++) {

                //contribute right become 2 distincts rights
                if (shareds[i]["net-atos-entng-collaborativewall-controllers-CollaborativeWallController|contribute"] ) {
                    delete shareds[i]["net-atos-entng-collaborativewall-controllers-CollaborativeWallController|contribute"];
                    shareds[i]["net-atos-entng-collaborativewall-controllers-CollaborativeWallController|updateNote"] = true;
                    shareds[i]["net-atos-entng-collaborativewall-controllers-CollaborativeWallController|deleteNote"] =true;
                }
                //retrieve retrieve contains a new right
                if (shareds[i]["net-atos-entng-collaborativewall-controllers-CollaborativeWallController|retrieve"]) {
                    shareds[i]["net-atos-entng-collaborativewall-controllers-CollaborativeWallController|retrieveAllNotes"] = true;
                }
            }

            db.getCollection('collaborativewall').update({"_id" : collaborativeWall._id },{$set : { "shared" : shareds} });
        }

    }
);
