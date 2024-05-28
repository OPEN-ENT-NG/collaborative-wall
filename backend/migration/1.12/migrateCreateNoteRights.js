

var existingRight = "net-atos-entng-collaborativewall-controllers-CollaborativeWallController|updateNote"
var newRight = "net-atos-entng-collaborativewall-controllers-CollaborativeWallController|createNote"
db.collaborativewall.find({}).forEach(function (doc) {
    if(addRight(doc)){
        var update = { '$set': {} }
        update["$set"]["shared"] = doc.shared;
        db.collaborativewall.update({ _id: doc._id }, update)
    }
})
function addRight(doc) {
    let changed = false;
    if (!doc.shared) {
        return changed;
    }
    for (var i = 0; i < doc.shared.length; i++) {
        var item = doc.shared[i];
        if(item[existingRight]){
            item[newRight] = true;
            changed = true;
        }
    }
    return changed;
}