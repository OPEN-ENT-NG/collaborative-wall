import { model } from 'entcore';
import http from 'axios';

export let collaborativewall: any = {};

collaborativewall.Wall = function() {};
collaborativewall.Note = function() {};

collaborativewall.Note.prototype = {
    toJSON: function() {
        return {
            content: this.content,
            owner: this.owner,
            lastEdit: this.lastEdit,
            x: this.x,
            y: this.y,
            zindex: this.zindex,
            color: this.color
        }
    }
} 

collaborativewall.Wall.prototype = {
    /**
     * Allows to save the wall. If the wall is new and does not have any id set,
     * this method calls the create method otherwise it calls the update method.
     * @param callback a function to call after saving.
     */
    save: function(callback) {
        if(this._id) {
            this.update(callback);
        } else {
            this.create(callback);
        }
    },
    /**
     * Allows to create a new wall. This method calls the REST web service to
     * persist data.
     * @param callback a function to call after create.
     */
    create: function(callback) {
        http.post('/collaborativewall', this.toJSON()).then(function() {
            if(typeof callback === 'function'){
                callback();
            }
        });
    },
    /**
     * Allows to update the wall. This method calls the REST web service to persist
     * data.
     * @param callback a function to call after update.
     */
    update: function(callback) {
        http.put('/collaborativewall/' + this._id, this.toJSON()).then(function() {
            if(typeof callback === 'function'){
                callback();
            }
        });
    },
    /**
     * Allows to contribute to the wall. This method calls the REST web service to persist
     * data.
     * @param callback a function to call after update.
     */
    contribute: function(callback) {
        http.put('/collaborativewall/contribute/' + this._id, this.toJSON()).then(function() {
            if(typeof callback === 'function'){
                callback();
            }
        });
    },
    /**
     * Allows to delete the wall. This method calls the REST web service to delete
     * data.
     * @param callback a function to call after delete.
     */
    delete: function(callback) {
        http.delete('/collaborativewall/' + this._id.toJSON()).then(function() {
            model.walls.remove(this);
            if(typeof callback === 'function'){
                callback();
            }
        }.bind(this));
    },
    /**
     * Allows to convert the current wall into a JSON format.
     * @return the current wall in JSON format.
     */
    toJSON: function() {
        return {
            icon: this.icon,
            name: this.name,
            description: this.description,
            background: this.background,
            notes: this.notes.map(note => note.toJSON())
        }
    }
}