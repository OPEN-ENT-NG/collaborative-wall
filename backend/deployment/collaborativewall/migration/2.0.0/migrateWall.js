var cursor = db.collaborativewall.find();
var counter = 0
while (cursor.hasNext()) {
  var doc = cursor.next();
  var oldBackground = doc.background;
  if (typeof oldBackground !== "object") {
    db.collaborativewall.update(
      { _id: doc._id },
      {
        $set: {
          background: {
            path: "img/green-hill.png",
            color: "",
          },
          oldBackground: oldBackground,
        },
      }
    );
    counter++
  }
}
print("Number of wall updated:"+counter)
