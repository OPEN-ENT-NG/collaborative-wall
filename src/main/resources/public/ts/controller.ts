import { ng, routes, angular, moment, _, template } from 'entcore';
import { collaborativewall } from './model';

let elts: any;

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
export const wallController = ng.controller('WallController', ['$scope', 'model', 'route', function($scope, model, route) {
    $scope.template = template;
    $scope.walls = model.walls;
    $scope.me = model.me;
    $scope.noteColors =[[
    '#F6CECE','#F5A9A9'],[
    '#F6D8CE','#F5BCA9'],[
    '#F6E3CE','#F5D0A9'],[
    '#F5ECCE','#F3E2A9'],[
    '#F5F6CE','#F2F5A9'],[
    '#ECF6CE','#E1F5A9'],[
    '#E3F6CE','#D0F5A9'],[
    '#D8F6CE','#BCF5A9'],[
    '#CEF6CE','#A9F5A9'],[
    '#CEF6D8','#A9F5BC'],[
    '#CEF6E3','#A9F5D0'],[
    '#CEF6EC','#A9F5E1'],[
    '#CEF6F5','#A9F5F2'],[
    '#CEECF5','#A9E2F3'],[
    '#CEE3F6','#A9D0F5'],[
    '#CED8F6','#A9BCF5'],[
    '#CECEF6','#A9A9F5'],[
    '#D8CEF6','#BCA9F5'],[
    '#E3CEF6','#D0A9F5'],[
    '#ECCEF5','#E2A9F3'],[
    '#F6CEF5','#F5A9F2'],[
    '#F6CEEC','#F5A9E1'],[
    '#F6CEE3','#F5A9D0'],[
    '#F6CED8','#F5A9BC'],[
    '#F2F2F2','#E6E6E6']
    ];
    $scope.themes=['/collaborativewall/public/img/default.jpg', '/collaborativewall/public/img/wood.jpg', '/collaborativewall/public/img/paper.jpg'];
    $scope.searchbar = {};
    $scope.display = {};
    $scope.error = false;
    $scope.showColor =false;
    $scope.notDesktop = navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile/i) != null;

    // Action according to the current given route.
    route({
        displayFullScreen: function(params) {
            $scope.walls.one('sync', function() {
                var wall = $scope.walls.find(function(w) {
                    return w._id === params.wallId;
                });
                $scope.openWallFullScreen(wall);
                 template.open('side-panel', 'side-panel');
            });
        },
        printWall: function(params) {
            $scope.walls.one('sync', async function() {
                var wall = $scope.walls.find(function(w) {
                    return w._id === params.wallId;
                });
                await wall.syncNotes();

                $scope.printWall(wall);
            });
        },
        mainPage: function() {
            if(window.location.href.indexOf('printnotes') !== -1){
                var url = window.location.search;
                if(url != undefined){
                    url = url.substring(url.lastIndexOf('=')+1);
                    $scope.walls.one('sync', async function() {
                        var wall = $scope.walls.find(function(w) {
                            return w._id === url;
                        });

                        await wall.syncNotes();

                        $scope.printNotes(wall);
                    });
                }

            }else{
                template.open('main', 'wall-list');
                 template.open('side-panel', 'side-panel');
            }
        }
    });

    /**
     * Allows to open the given wall into the "main" div using the
     * "wall-view.html" template.
     * @param wall the current wall to open.
     * UTILE ?
     */
    $scope.openWall = function(wall) {
        $scope.wall = wall;
        $scope.wall.syncNotes();
        $scope.hideAlmostAllButtons(wall);
        // $scope.wallmodeview = true;
        template.open('main', 'wall-view');
    };

    /**
     * Allows to create a new wall and open the "wall-edit.html" template into
     * the "main" div.
     */
    $scope.newWall = function() {
        $scope.wall = new collaborativewall.Wall();
        $scope.wall.background = $scope.themes[0];
        template.open('main', 'wall-edit');
        $scope.wallmodeview = true;
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
        $scope.wallmodeview = true;
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
        template.open('main', 'wall-list');
        delete $scope.master;
        delete $scope.wall;
        $scope.hideAlmostAllButtons();
        $scope.wallmodeview = false;
    };

    /**
     * Allows to save the current edited wall in the scope. After saving the
     * current wall this method closes the edit view too.
     */
    $scope.saveWall = function() {
        $scope.master = angular.copy($scope.wall);
        $scope.wallmodeview = false;
        $scope.master.save(function() {
            $scope.walls.sync(function() {
                $scope.cancelWallEdit();
                updateSearchBar();
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
     * UTILE ?
     */
    $scope.removeWall = function() {
        if ($scope.wall) {
            $scope.wall.delete();
            delete $scope.display.confirmDeleteWall;
            delete $scope.wall;
        }
        // template.close('main');
        template.open('main', 'wall-list');
    };

    $scope.printWall = function(wall) {
        if (wall) {
            $scope.wall = wall;
            $scope.$apply();
            setTimeout(function() { window.print(); }, 1000);
        }
    };
    /**
    * Print current note
    * @param wall
    *
    */
    $scope.printNotes = function(wall){
        if(wall){
            $scope.wall = wall;
            $scope.$apply();
            setTimeout(function(){window.print();}, 1000);
        }
    };

    /**
     * Allows to open the "share" panel by setting the
     * "$scope.display.showPanel" variable to "true".
     * @param wall the wall to share.
     * @param event the current event.
     * UTILE ?
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
    $scope.openWallFullScreen = async function(wall) {
        if (wall) {
            $scope.wall = wall;
            await $scope.wall.syncNotes();
            $scope.error = false;
            $scope.note = undefined;
            $scope.wallmodeview = true;
            template.open('main', 'wall-full');
        } else {
            $scope.wall = undefined;
            $scope.error = true;
            template.open('error', 'wall-error');
        }
    };

    /**
     * Allows to return to the list of walls.
     * UTILE ?
     */
    $scope.closeWallFullScreen= function() {
        // template.close('main');
        template.open('main', 'wall-list');
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

        var newNote = new collaborativewall.Note();
        newNote.content = "";
        newNote.owner = {};
        newNote.owner.userId = $scope.me.userId;
        newNote.owner.displayName = $scope.me.username;
        newNote.x = (x) ? x : 10;
        newNote.y = (y) ? y : 10;
        newNote.color = $scope.getUserNoteColor();
        newNote.idwall = $scope.wall._id;
        $scope.wall.notes.push(newNote);
        newNote.save($scope.wall, () => $scope.$apply());

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
                notes[index].delete($scope.wall,() => $scope.$apply())
            }
        }
        $scope.cancelRemoveNote();
    };

    /**
     * Open wall list template and delete note in scope
     */
    $scope.backToWallList = function() {
        template.open("main","wall-list");
        delete $scope.note;
    };
    /**
     * Allows to edit the given note.
     * @param event the current event.
     */
    $scope.editNote = function(note, event) {
        event.stopPropagation();
        if ($scope.hasRight($scope.wall, note)) {
            $scope.note = note;
            template.open("main","edit-note");
        }else{
            $scope.note = note;
            template.open("main","view-note");
        }
    };

    /**
     * Allows to save the current editing note.
     */
    $scope.saveNote = function() {
        if ($scope.note) {
            $scope.note.save($scope.wall,() => $scope.$apply());
            delete $scope.note;
        }
        template.open("main","wall-full");
    };

    /**
     * Allows to cancel the current editing note.
     */
    $scope.cancelNote = function() {
        template.open("main","wall-full");
        delete $scope.note;
    };

    /**
     * Allows to get if the current logged user can edit or remove a note. Only
     * the owner of the wall or the owner of the note can do those actions. The
     * user must have contributor rights.
     * @return true if the current user can edit or delete the given note.
     */
    $scope.hasRight = function(wall, note) {
        return wall &&  wall.myRights.contrib && (wall.myRights.manage ||((note && note.owner && note.owner.userId === $scope.me.userId) || (wall.owner.userId === $scope.me.userId)));
    };

    /**
    * Allows user if he can edit on wall
    * @param wall to edit
    * @return true if user can edit wall.
    *
    */
    $scope.hasWallRight = function(wall){
        return wall && wall.myRights.contrib ;
    };

     /**
    * Allows user if he can edit on wall
    * @param wall to edit
    * @return true if user can edit wall.
    *
    */
    $scope.hasManageRight = function(wall){
        return wall && wall.myRights.manage ;
    };

    /**
    * Update html element Zindex, When a note is edited, his z-index property is updated to the top;
    * @param el: element  div
    *
    */
    $scope.updateDivZIndex = function(el){
            elts = el.parentElement.children;
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
            return el.style.zIndex;
    };

    /**
    * Set color for each user's Note
    * @param color (head and content) ,user's id
    */
    $scope.setColor = function(color){
        $scope.note.color = color;
        $scope.note.save($scope.wall);
        $scope.note = undefined;
        $scope.colorPickerClicked = true;

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
        }
        return ['#F5F6CE','#F2F5A9'];
    };

    /**
    * Switch on/off color selector
    * @param userIdColor user's id of a note selected
    */
    $scope.toogleShowColor = function(note){
        $scope.showColor = !$scope.showColor;
        $scope.note = note;
    };

    /**
    * Keep colorpicker Open
    *
    */
    $scope.mouseOverColorPicker = function(){
        if($scope.showColor){
            $scope.mouseIsOverColorPicker = true;
        }

    };

    /**
    * Close color picker when mouse leaves color aera.
    *
    */
    $scope.mouseLeaveColorPicker = function(){
        if($scope.showColor && $scope.mouseIsOverColorPicker && $scope.colorPickerClicked){
            $scope.showColor = false;
            $scope.mouseIsOverColorPicker = false;
            $scope.colorPickerClicked = false;
        }
    };


    /**
    * Display note in a lightbox
    * @param note to display
    *
    */
    $scope.viewNote = function(note){
        $scope.note = note;
        $scope.display.note = true;
    };

    /**
    * Close note's lightbox
    *
    */
    $scope.closeViewNote = function(){
        $scope.display.note= false;
        delete $scope.note;
    };

    /**
     * Allows to put the current poll in the scope and set "confirmDeletePoll"
     * variable to "true".
     * @param poll the poll to delete.
     * @param event an event.
     * UTILE ?
     */
    $scope.confirmRemoveWalls = function(walls, event) {
       // $scope.poll = poll;
        $scope.display.confirmDeletePoll = true;
        event.stopPropagation();
    };

    /**
    * Allows to remove several walls
    */
    $scope.removeWalls = function(){


        _.map($scope.walls.selection(), function(wallToRemove){
            wallToRemove.delete( function(){
                // Update search bar, without any server call
                $scope.searchbar = _.filter($scope.searchbar, function(wall){
                    return wall._id !== wallToRemove._id;
                });
            });
        });
        delete $scope.display.confirmDeleteWall;
    };

    var updateSearchBar = function(){
        $scope.walls.sync(function() {
            $scope.searchbar =_.map($scope.walls.all, function(wall){
                return {
                    title : wall.name,
                    _id : wall._id,
                    toString : function() {
                        return this.title;
                    }
                };

           });
        });
    };
    updateSearchBar();

    /**
    * Open wall from a searchbar
    * @param wall's id
    */
    $scope.openWallFromSearchbar = async function(wallId){
        await $scope.openWallFullScreen($scope.getWallById(wallId));
        $scope.$apply();
    };

    /**
    * Check if an user ar editing a wall.
    */
    $scope.isCreatingOrEditing = function(){
            return (template.contains('main', 'wall-full'));
    };

    /**
    * Get a wall with an id
    * @param Wall._id
    * @return wall
    */
    $scope.getWallById = function(wallId){
        return _.find(model.walls.all, function(wall){
            return wall._id === wallId;
        });
    };

    $scope.formatDate = function(dateObject){
        if (dateObject != null){
            if (dateObject.$date == null) // Handle string date (ex : note.lastEdit)
                return moment(dateObject).local().calendar();
            else 
                return moment(dateObject.$date).local().calendar();
        }
    };

}]);