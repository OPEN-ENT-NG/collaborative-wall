import {angular, model, notify} from 'entcore';
import {Mix} from 'entcore-toolkit';
import http from 'axios';

export let collaborativewall: any = {};

collaborativewall.Wall = function () {

};
collaborativewall.Note = function () {


};

collaborativewall.Note.prototype = {


    /**
     * Allows to save a Note. If the note is new and does not have any id set,
     * this method calls the create method otherwise it calls the update method.
     * @param callback a function to call after saving.
     */
    save: function (wall, callback) {
        if (this._id) {
            this.update(wall, callback);
        } else {
            this.create(wall, callback);
        }
    },
    /**
     * Allows to create a new note. This method calls the REST web service to
     * persist data.
     * @param callback a function to call after create.
     */
    create: function (wall, callback) {
        http.post(`/collaborativewall/${wall._id}/note`, this.toJSON()).then((result) => {

            wall.notes = Mix.castArrayAs(collaborativewall.Note, result.data.wall).sort(compareLastEdit);

            //give a zIndex to each Note according to lastEdit date
            wall.notes.forEach((note, key) => {
                note.zIndex = key;
            });

            if (result.data.status !== "ok") {
                notify.info(result.data.status);
            }

            if (typeof callback === 'function') {
                callback();
            }
        }).catch(() => {
            notify.error("collaborativewall.error");
        });
    },
    /**
     * Allows to update the note (wall id is in the note). This method calls the REST web service to persist
     * data.
     * @param callback a function to call after update.
     */
    update: function (wall, callback) {
        http.put(`/collaborativewall/${wall._id}/note/${this._id}`, this.toJSON()).then((result) => {

            wall.notes = Mix.castArrayAs(collaborativewall.Note, result.data.wall).sort(compareLastEdit);

            //give a zIndex to each Note according to lastEdit date
            wall.notes.forEach((note, key) => {
                note.zIndex = key;
            });

            if (result.data.status !== "ok") {
                notify.info(result.data.status);
            }

            if (typeof callback === 'function') {
                callback();
            }
        }).catch(() => {
            notify.error("collaborativewall.error");
        });
    },
    /**
     * Allows to delete the note (wall id is in the note). This method calls the REST web service to delete
     * data.
     * @param callback a function to call after delete.
     */
    delete: function (wall, callback) {

        http.delete(`/collaborativewall/${wall._id}/note/${this._id}?lastEdit=${this.modified.$date}`).then((result) => {


            wall.notes = Mix.castArrayAs(collaborativewall.Note, result.data.wall).sort(compareLastEdit);

            if (result.data.status !== "ok") {
                notify.info(result.data.status);
            }

            if (typeof callback === 'function') {
                callback();
            }
        }).catch(() => {
            notify.error("collaborativewall.error");
        });
    },
    toJSON: function () {
        return {
            content: this.content,
            modified: this.modified,
            x: this.x,
            y: this.y,
            idwall: this.idwall,
            color: this.color
        }
    },

};;

/**
 * Compare two Notes on lastEdit property
 * @param a - first Note
 * @param b - second Note
 * @returns {number} 0 = same LastEdit, 1 = a after b , -1 a before b
 */
function compareLastEdit(a, b) {
    if (a.modified.$date < b.modified.$date)
        return -1;
    if (a.modified.$date > b.modified.$date)
        return 1;
    return 0;
}

collaborativewall.Wall.prototype = {
    /**
     * Allows to get all notes of this wall.
     * @param callback a function to call after saving.
     */
    syncNotes: async function () {
        let {data} = await http.get(`/collaborativewall/${this._id}/notes`);

        this.notes = Mix.castArrayAs(collaborativewall.Note, data).sort(compareLastEdit);
        //give a zIndex to each Note according to lastEdit date
        this.notes.forEach((note, key) => {
            note.zIndex = key;
        });
    },
    /**
     * Allows to save the wall. If the wall is new and does not have any id set,
     * this method calls the create method otherwise it calls the update method.
     * @param callback a function to call after saving.
     */
    save: function (callback) {
        if (this._id) {
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
    create: function (callback) {
        http.post('/collaborativewall', this.toJSON()).then(function () {
            if (typeof callback === 'function') {
                callback();
            }
        }).catch(() => {
            notify.error("collaborativewall.error");
        });
    },
    /**
     * Allows to update the wall. This method calls the REST web service to persist
     * data.
     * @param callback a function to call after update.
     */
    update: function (callback) {
        http.put('/collaborativewall/' + this._id, this.toJSON()).then(function () {
            if (typeof callback === 'function') {
                callback();
            }
        }).catch(() => {
            notify.error("collaborativewall.error");
        });
    },
    /**
     * Allows to delete the wall. This method calls the REST web service to delete
     * data.
     * @param callback a function to call after delete.
     */
    delete: function (callback) {
        http.delete('/collaborativewall/' + this._id, this.toJSON()).then(function () {
            model.walls.remove(this);
            if (typeof callback === 'function') {
                callback();
            }
        }.bind(this)).catch(() => {
            notify.error("collaborativewall.error");
        });
    },
    /**
     * Allows to convert the current wall into a JSON format.
     * @return the current wall in JSON format.
     */
    toJSON: function () {
        return {
            icon: this.icon,
            name: this.name,
            description: this.description,
            background: this.background,

        }
    },

    notesCount: function () {
        if (this.notes !== undefined) {
            return this.notes.length;
        } else {
            if (this.nbnotes !== undefined) {
                return this.nbnotes;
            } else {
                return 0;
            }
        }

    }
};