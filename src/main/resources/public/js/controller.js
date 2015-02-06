


/**
 * Allows to define routes of collaborative walls application.
 */
routes.define(function($routeProvider){
    $routeProvider
      .when('/view/:wallId', {
        action: 'displayFullScreen'
      })
      .otherwise({
        action: 'mainPage'
      });
});

/**
 * Controller for walls. All methods contained in this controller can be called
 * from the view.
 * @param $scope Angular JS model.
 * @param template all templates.
 * @param model the wall model.
 * @param route route system.
 */
function WallController($scope, template, model, route) {
    $scope.template = template;
    $scope.walls = model.walls;
    $scope.me = model.me;

    $scope.themes=['/collaborativewall/public/img/default.jpg', '/collaborativewall/public/img/wood.jpg', '/collaborativewall/public/img/paper.jpg'];
    
    $scope.display = {};
    $scope.error = false;

    // Action according to the current given route.
    route({
        displayFullScreen: function(params) {
            walls.one('sync', function() {
                var wall = walls.find(function(w) {
                    return w._id === params.wallId;
                });
                $scope.openWallFullScreen(wall);
            });
        },
        mainPage: function() {
            template.open('walls', 'wall-list');
        }
    });

    /**
     * Allows to open the given wall into the "main" div using the
     * "wall-view.html" template.
     * @param wall the current wall to open.
     */
    $scope.openWall = function(wall) {
        $scope.wall = wall;
        $scope.hideAlmostAllButtons(wall);
        template.open('main', 'wall-view');
    };
    
    /**
     * Allows to create a new wall and open the "wall-edit.html" template into
     * the "main" div.
     */
    $scope.newWall = function() {
        $scope.wall = new Wall();
        template.open('main', 'wall-edit');
    };

    /**
     * Allows to edit the given wall into the "main" div using the
     * "wall-edit.html" template. This method create two variables in the scope :
     * <ul>
     * <li>master : keep a reference to the current edited wall.</li>
     * <li>wall : a copy of the given wall to edit.</li>
     * </ul>
     * @param wall the current wall to edit.
     * @param event the current event.
     */
    $scope.editWall = function(wall, event) {
        wall.showButtons = false;
        $scope.master = wall;
        $scope.wall = angular.copy(wall);
        event.stopPropagation();
        template.open('main', 'wall-edit');
    };
    
    /**
     * Allows to set "showButtons" to false for all walls except the given one.
     * @param wall the current selected wall.
     */
    $scope.hideAlmostAllButtons = function(wall) {
        $scope.walls.forEach(function(w) {
            if(!wall || w._id !== wall._id){
                w.showButtons = false;
            }
        });
    };
    
    /**
     * Allows to cancel the current wall edition. This method removes the "wall"
     * variable and close the "main" template.
     */
    $scope.cancelWallEdit = function() {
        delete $scope.master;
        delete $scope.wall;
        $scope.hideAlmostAllButtons();
        template.close('main');
    };

    /**
     * Allows to save the current edited wall in the scope. After saving the
     * current wall this method closes the edit view too.
     */
    $scope.saveWall = function() {
        $scope.master = angular.copy($scope.wall);
        $scope.master.save(function() {
            $scope.walls.sync(function() {
                $scope.cancelWallEdit();
            });
        });
    };

    /**
     * Allows to put the current wall in the scope and set "confirmDeleteWall"
     * variable to "true".
     * @param wall the wall to delete.
     * @param event an event.
     */
    $scope.confirmRemoveWall = function(wall, event) {
        $scope.wall = wall;
        $scope.display.confirmDeleteWall = true;
        event.stopPropagation();
    };
    
    /**
     * Allows to cancel the current delete process.
     */
    $scope.cancelRemoveWall = function() {
        delete $scope.display.confirmDeleteWall;
    };
    
    /**
     * Allows to remove the current wall in the scope.
     */
    $scope.removeWall = function() {
        $scope.wall.delete();
        delete $scope.display.confirmDeleteWall;
        delete $scope.wall;
        template.close('main');
    };
    
    /**
     * Allows to open the "share" panel by setting the
     * "$scope.display.showPanel" variable to "true".
     * @param wall the wall to share.
     * @param event the current event.
     */
    $scope.shareWall = function(wall, event) {
        $scope.wall = wall;
        $scope.display.showPanel = true;
        event.stopPropagation();
    };
    
    /**
     * Allows to open the given wall in full screen.
     * @param wall a wall to open in full screen.
     */
    $scope.openWallFullScreen = function(wall) {
        if (wall) {
            $scope.wall = wall;
            $scope.error = false;
            $scope.note = undefined;
            template.close('main');
            template.open('walls', 'wall-full');
        } else {
            $scope.wall = undefined;
            $scope.error = true;
            template.open('error', '404');
        }
    };
    
    /**
     * Allows to return to the list of walls.
     */
    $scope.closeWallFullScreen= function() {
        template.close('main');
        template.open('walls', 'wall-list');
    };
    
    $scope.updateBackground = function(theme) {
        if (theme) {
            $scope.wall.background = theme;
        }
        $scope.wall.contribute();
    }
    
    /**
     * Allows to add a new note into the current wall.
     */
    $scope.addNote = function() {
        if ($scope.wall.notes === undefined) {
            $scope.wall.notes = [];
        }

        var newNote = new Note();
        newNote.content = "";
        newNote.owner = {};
        newNote.owner.userId = $scope.me.userId;
        newNote.owner.username = $scope.me.username;
        newNote.x = 0;
        newNote.y = 0;
        
        $scope.wall.notes.push(newNote);
        $scope.wall.contribute();
    };
    
    /**
     * Allows to remove a note at the given index.
     * @param index the index of the note to remove of the list
     */
    $scope.removeNote = function(index) {
        if ($scope.wall) {  
            var notes = $scope.wall.notes;
            if (notes && index >= 0 && index < notes.length) {
                notes.splice(index, 1);
                $scope.wall.contribute();
            }
        }
    };
    
    /**
     * @param event the current event.
     */
    $scope.editNote = function(note, event) {
        event.stopPropagation();
        if (note && note.owner && note.owner.userId === $scope.me.userId) {
            $scope.note = note;
        }
    };
    
    $scope.saveNote = function() {
        if ($scope.note) {
            $scope.wall.contribute();
            delete $scope.note;
        }
    };
    
    $scope.cancelNote = function() {
        delete $scope.note;
    };
}
