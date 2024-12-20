/**
 * Add new Note read rights ("getNote" / "viewNote") if the wall has "retrieve" right in the shared rights array.
 */

const RETRIEVE_RIGHT =
  "net-atos-entng-collaborativewall-controllers-CollaborativeWallController|retrieve";
const GET_NOTE_RIGHT =
  "net-atos-entng-collaborativewall-controllers-CollaborativeWallController|getNote";
const VIEW_NOTE_RIGHT =
  "net-atos-entng-collaborativewall-controllers-CollaborativeWallController|viewNote";

let counter = 0;

db.collaborativewall.find().forEach((wall) => {
  if (wall.hasOwnProperty("shared")) {
    const newShared = wall.shared;

    newShared.forEach((sharedItem) => {
      let added = false;
      if (sharedItem[RETRIEVE_RIGHT] && !sharedItem[GET_NOTE_RIGHT]) {
        sharedItem[GET_NOTE_RIGHT] = true;
        added = true;
      }

      if (sharedItem[RETRIEVE_RIGHT] && !sharedItem[VIEW_NOTE_RIGHT]) {
        sharedItem[VIEW_NOTE_RIGHT] = true;
        added = true;
      }

      if (added) {
        counter++
      }
    });

    db.collaborativewall.update(
      { _id: wall._id },
      {
        $set: {
          shared: newShared,
        },
      }
    );
  }
});

print("Number of shared items updated:", counter);
