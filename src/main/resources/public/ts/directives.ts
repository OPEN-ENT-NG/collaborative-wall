import { ng, angular } from 'entcore';

let mouseX: any;
let mouseY: any;

export const stickyDirective = ng.directive('sticky', ['$document', function($document) {
    return {
        restrict : 'E',
        transclude : true,
        replace : true,
        template : '<div><div ng-transclude></div></div>',
        link : function(scope, element, attr) {

            var startX = 0;
            var startY = 0;

            var x = scope.n.x;
            var y = scope.n.y;
            var zindex = scope.n.zindex;

            var elt = element[0];

            updateUI();

            // Add a draggable zone
            var draggableZone = angular.element(elt.querySelector('.draggable'));
            if (draggableZone) {
                draggableZone.css({
                    "cursor" : "move"
                });

                draggableZone.on('mousedown', function(event) {
                    // Prevent default dragging of selected content
                    event.preventDefault();
                    startX = event.screenX - x;
                    startY = event.screenY - y;
                    $document.on('mousemove', mousemove);
                    $document.on('mouseup', mouseup);
                });
            }

            // Information to display on mouse over
            var informationZone = angular.element(elt.querySelector('.note-bottom'));
            var buttonZone = angular.element(elt.querySelector('.note-top-button'));

            manageDisplay(informationZone, "none");
            manageDisplay(buttonZone, "none");

            element.on('mouseenter', function(event) {
                manageDisplay(informationZone, "block");
                manageDisplay(buttonZone, "block");

                var imgs =element.find('.note-content').find('img');
                for(var i= 0; i < imgs.length; i++){
                    imgs[i].addEventListener('click',function(event){
                        event.preventDefault();
                    });
                }
            });

            element.on('mouseleave', function(event) {
                manageDisplay(informationZone, "none");
                manageDisplay(buttonZone, "none");
            });

            /**
             * Allows to change the sticky note position
             * @event the current mouse event.
             */
            function mousemove(event) {
                y = event.screenY - startY;
                x = event.screenX - startX;
                if (x < 0) {
                    x = 0;
                }

                if (y < 0) {
                    y = 0;
                }
                scope.updateZIndex(scope.n,true);
                scope.updateDivZIndex(element.context);
                scope.n.x = x;
                scope.n.y = y;
                zindex = scope.n.zindex;
                updateUI();
            }

            /**
             * Allows to stop the current drag and save the current
             * position of the sticky note in the wall.
             */
            function mouseup() {
                $document.off('mousemove', mousemove);
                $document.off('mouseup', mouseup);
                scope.wall.contribute();
            }

            /**
             * Allows to update the current sticky note position in the
             * wall. This method takes the x and y global variables.
             */
            function updateUI() {
                element.css({
                    "position" : "absolute",
                    "top" : y + "px",
                    "left" : x + "px",
                    "z-index": zindex
                });
            }

            /**
             * Allows to modify the "display" CSS properties of the
             * given element.
             * @param elt an element to modify.
             * @param display the text to put into the "display" CSS
             * properties, for example "none" or "block".
             */
            function manageDisplay(elt, display) {
                if (elt) {
                    elt.css({
                        "display" : display
                    });
                }
            }
        }
    }
}]);

/**
 * Directive to create a board to display sticky notes. This directive
 * manage the background.
 */
export const boardDirective = ng.directive('board', function() {
    return {
        restrict : 'E',
        transclude : true,
        replace : true,
        template : '<div><div ng-transclude></div></div>',
        link : function(scope, element, attr) {
            var elt = element[0];

            // Allows to create a new sticky note under the current
            // cursor position
            element.on('dblclick', function(event) {
                if(scope.$parent.hasWallRight(scope.$parent.wall)){
                    if (event.offsetX == null) { // Firefox
                        mouseX = event.originalEvent.layerX;
                        mouseY = event.originalEvent.layerY;
                    } else { // Other browsers
                        mouseX = event.offsetX;
                        mouseY = event.offsetY;
                    }
                    scope.addNote(mouseX, mouseY);
                }
            });

            scope.$watch("wall", function() {
                if(scope.wall.background.indexOf("/collaborativewall/public/img")> -1 ){
                    element.css({
                        "position" : "relative",
                        "display" : "block",
                        "width":"1833px",
                        "height":"600px",
                        "background-repeat" : "repeat",
                        "background-position" : "center fixed",
                        "background-image" : "url(" + scope.wall.background + ")"
                    });
                }else{
                    element.css({
                        "position" : "relative",
                        "display" : "block",
                        "background-repeat" : "no-repeat",
                        "background-position" : "center fixed",
                        "background-size" : "cover",
                        "background-image" : "url(" + scope.wall.background + ")"
                    });
                }
            });
        }
    }
});
export const sglclickDirective = ng.directive('sglclick', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
          var fn = $parse(attr['sglclick']);
          var delay = 300, clicks = 0, timer = null;
          element.on('click', function (event) {
            clicks++;  //count clicks
            if(clicks === 1) {
              timer = setTimeout(function() {
                scope.$apply(function () {
                    fn(scope, { $event: event });
                }); 
                clicks = 0;             //after action performed, reset counter
              }, delay);
              } else {
                clearTimeout(timer);    //prevent single-click action
                clicks = 0;             //after action performed, reset counter
              }
          });
        }
    };
}]);