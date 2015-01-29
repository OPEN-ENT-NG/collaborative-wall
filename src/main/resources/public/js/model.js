
/**
 * Model to create a wall.
 */
function Wall() {}

/**
 * Allows to save the wall. If the wall is new and does not have any id set,
 * this method calls the create method otherwise it calls the update method.
 * @param callback a function to call after saving.
 */
Wall.prototype.save = function(callback) {
    if(this._id) {
        this.update(callback);
    } else {
        this.create(callback);
    }
};

/**
 * Allows to create a new wall. This method calls the REST web service to
 * persist data.
 * @param callback a function to call after create.
 */
Wall.prototype.create = function(callback) {
    http().postJson('/collaborativewall', this).done(function() {
        if(typeof callback === 'function'){
            callback();
        }
    });
};

/**
 * Allows to update the wall. This method calls the REST web service to persist
 * data.
 * @param callback a function to call after create.
 */
Wall.prototype.update = function(callback) {
    http().putJson('/collaborativewall/' + this._id, this).done(function() {
        notify.info('wall.save.info');
        if(typeof callback === 'function'){
            callback();
        }
    });
};

/**
 * Allows to delete the wall. This method calls the REST web service to delete
 * data.
 * @param callback a function to call after delete.
 */
Wall.prototype.delete = function(callback) {
    http().delete('/collaborativewall/' + this._id).done(function() {
        model.walls.remove(this);
        if(typeof callback === 'function'){
            callback();
        }
    }.bind(this));
};

/**
 * Allows to convert the current wall into a JSON format.
 * @return the current wall in JSON format.
 */
Wall.prototype.toJSON = function() {
    return {
        icon: this.icon,
        name: this.name,
        description: this.description
    }
};

/**
 * Allows to create a model and load the list of walls from the backend.
 */
model.build = function() {
    this.makeModel(Wall);
    
    this.collection(Wall, {
        sync: function(callback){
            http().get('/collaborativewall/list/all').done(function(walls){
                this.load(walls);
                if(typeof callback === 'function'){
                    callback();
                }
            }.bind(this));
        },
        behaviours: 'collaborativewall'
    });
};