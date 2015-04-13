


/**
 * Allows to define routes of collaborative walls application.
 */
routes.define(function($routeProvider){
    $routeProvider
      .when('/view/:wallId', {
        action: 'displayFullScreen'
      })
      .when('/print/:wallId', {
        action: 'printWall'
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
    $scope.noteColors =[[
    '#F78181','#FF0000'],[
    '#F79F81','#FF4000'],[
    '#F7BE81','#FF8000'],[
    '#F5DA81','#FFBF00'],[
    '#F3F781','#FFFF00'],[
    '#D8F781','#BFFF00'],[
    '#BEF781','#80FF00'],[
    '#9FF781','#40FF00'],[
    '#81F781','#00FF00'],[
    '#81F79F','#00FF40'],[
    '#81F7BE','#00FF80'],[
    '#81F7D8','#00FFBF'],[
    '#81F7F3','#00FFFF'],[
    '#81DAF5','#00BFFF'],[
    '#81BEF7','#0080FF'],[
    '#819FF7','#0040FF'],[
    '#8181F7','#0000FF'],[
    '#9F81F7','#4000FF'],[
    '#BE81F7','#8000FF'],[
    '#DA81F5','#BF00FF'],[
    '#F781F3','#FF00FF'],[
    '#F781D8','#FF00BF'],[
    '#F781BE','#FF0080'],[
    '#F7819F','#FF0040'],[
    '#D8D8D8','#848484']
    ];
    $scope.themes=['/collaborativewall/public/img/default.jpg', '/collaborativewall/public/img/wood.jpg', '/collaborativewall/public/img/paper.jpg'];
    
    $scope.display = {};
    $scope.error = false;
    $scope.showColor =false;

    // Action according to the current given route.
    route({
        displayFullScreen: function(params) {
            $scope.walls.one('sync', function() {
                var wall = $scope.walls.find(function(w) {
                    return w._id === params.wallId;
                });
                $scope.openWallFullScreen(wall);
            });
        },
        printWall: function(params) {
            $scope.walls.one('sync', function() {
                var wall = $scope.walls.find(function(w) {
                    return w._id === params.wallId;
                });
                $scope.printWall(wall);
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
        $scope.wall.background = $scope.themes[0];
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
        if ($scope.wall) {
            $scope.wall.delete();
            delete $scope.display.confirmDeleteWall;
            delete $scope.wall;
        }
        template.close('main');
    };
    
    $scope.printWall = function(wall) {
        if (wall) {
            $scope.wall = wall;
            setTimeout(function() { window.print(); }, 1000);
        }
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

    /**
     * Allows to add a new note into the current wall.
     * @param x the x coordinate of the note.
     * @param y the x coordinate of the note.
     */
    $scope.addNote = function(x, y) {
        if ($scope.wall.notes === undefined) {
            $scope.wall.notes = [];
        }

        var newNote = new Note();
        newNote.content = "";
        newNote.owner = {};
        newNote.owner.userId = $scope.me.userId;
        newNote.owner.username = $scope.me.username;
        newNote.x = (x) ? x : 10;
        newNote.y = (y) ? y : 10;
        newNote.zindex = $scope.wall.notes.length;
        newNote.color = $scope.getUserNoteColor();
        $scope.wall.notes.push(newNote);
        $scope.wall.contribute();
        
        $scope.$apply();
    };
    
    /**
     * Allows to put the current note in the scope and set "confirmDeleteNote"
     * variable to "true".
     * @param note the note to delete.
     * @param event an event.
     */
    $scope.confirmRemoveNote = function(index, event) {
        $scope.display.deleteNoteIndex = index;
        $scope.display.noteElement = event.target.parentElement.parentElement.parentElement.parentElement;
        $scope.display.confirmDeleteNote = true;
        event.stopPropagation();
    };
    
    /**
     * Allows to cancel the current delete process.
     */
    $scope.cancelRemoveNote = function() {
        delete $scope.display.confirmDeleteNote;
        delete $scope.display.deleteNoteIndex;
        delete $scope.display.noteElement;
    };
    
    /**
     * Allows to remove a note at index $scope.display.deleteNoteIndex
     */
    $scope.removeNote = function() {
        if ($scope.wall) {
            var notes = $scope.wall.notes;
            var index = $scope.display.deleteNoteIndex;
            if (notes && index >= 0 && index < notes.length) {
                $scope.deleteZIndex(notes[index]);
                $scope.deleteDivZIndex($scope.display.noteElement);
                notes.splice(index, 1);
                $scope.wall.contribute();
            }
        }
        $scope.cancelRemoveNote();
    };

    /**
     * Open wall list template and delete note in scope
     */
    $scope.backToWallList = function() {
        template.open("walls","wall-list");
        delete $scope.note;
    };
    /**
     * Allows to edit the given note.
     * @param event the current event.
     */
    $scope.editNote = function(note, event) {
        
        event.stopPropagation();
        if ($scope.hasRight($scope.wall, note)) {
            $scope.updateZIndex(note, true);
            $scope.updateDivZIndex(event.currentTarget);
            $scope.note = note;
            template.open("walls","edit-note");
        }else{
            $scope.note = note;
            template.open("walls","view-note");
        }
    };
    
    /**
     * Allows to save the current editing note.
     */
    $scope.saveNote = function() {
        if ($scope.note) {
            $scope.note.lastEdit = moment().toDate();
            $scope.wall.contribute();
            delete $scope.note;
        }
        template.open("walls","wall-full");
    };
    
    /**
     * Allows to cancel the current editing note.
     */
    $scope.cancelNote = function() {
        template.open("walls","wall-full");
        delete $scope.note;
    };
    
    /**
     * Allows to get if the current logged user can edit or remove a note. Only
     * the owner of the wall or the owner of the note can do those actions. The
     * user must have contributor rights.
     * @return true if the current user can edit or delete the given note.
     */
    $scope.hasRight = function(wall, note) {
        return wall && wall.myRights.contrib && ((note && note.owner && note.owner.userId === $scope.me.userId) || (wall.owner.userId === $scope.me.userId));
    };

    /**
    * Persist Zindex. When a note is edited, his z-index propertie is updated to the top;
    * @param n: note , contribute: boolean
    * 
    */
    $scope.updateZIndex= function(n, contribute){
        var j= 0;
        
        for(var i = 0; i< $scope.wall.notes.length;i++){
            if($scope.wall.notes[i].zindex == n.zindex){
                j = i;
            }
            if($scope.wall.notes[i].zindex > n.zindex){
                    $scope.wall.notes[i].zindex--;
            }
        }
        $scope.wall.notes[j].zindex= $scope.wall.notes.length-1;
        if(contribute){
            $scope.wall.contribute();
        }
    };

    /**
    * Update html element Zindex, When a note is edited, his z-index propertie is updated to the top;
    * @param el: element  div
    * 
    */
    $scope.updateDivZIndex = function(el){
            elts =el.parentElement.children;
            var j = 0;
            for ( var i = 0 ; i < elts.length; i++){
                if(elts[i].style.zIndex ==el.style.zIndex){
                    j= i;
                }
                if(elts[i].style.zIndex>el.style.zIndex){
                    elts[i].style.zIndex--;
                }
            }
            elts[j].style.zIndex = elts.length-1;
    };

    /**
    * Reorder & Persist zindex. When a note is deleted, all z-index are reordered
    * @param n: note 
    * 
    */
    $scope.deleteZIndex = function (n){
        for(var i = 0; i< $scope.wall.notes.length;i++){
            if($scope.wall.notes[i].zindex > n.zindex){
                $scope.wall.notes[i].zindex--;
            }
        }
        $scope.wall.contribute();
    };
    
    /**
    * Reorder & update html element Zindex, When a note is deleted, all z-index are reordered
    * @param el: element 
    * 
    */
    $scope.deleteDivZIndex=function(el){
        elts =el.parentElement.children;
        for ( var i = 0 ; i < elts.length; i++){
            if(elts[i].style.zIndex > el.style.zIndex){
                    elts[i].style.zIndex--;
                } 
        }
    };

    /**
    * Set color for each user's Note
    * @param color (head and content)
    */
    $scope.setColor = function(color){
        angular.forEach($scope.wall.notes, function(note, key){
            if(note.owner.userId==$scope.me.userId){
                note.color = color;
            }

        });
        $scope.wall.contribute();
            
    };

    /**
    * Get a color who are already used for an user
    * @return color ( head and content)
    *
    */
    $scope.getUserNoteColor = function(){
        
        for (var i = 0; i < $scope.wall.notes.length; i++) {
            if($scope.wall.notes[i].owner.userId==$scope.me.userId){
                return $scope.wall.notes[i].color;
            }
        };
        return ['#F5F6CE','#F2F5A9'];
    };

    /**
    * Switch on/off color selector
    *
    */
    $scope.toogleShowColor = function(){
        $scope.showColor = !$scope.showColor;
    }

}
