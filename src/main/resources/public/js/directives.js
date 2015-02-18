var collaborativeWallExtension = {
    addDirectives : function(module) {

        /**
         * Directive to display sticky note. This directive allows to move the
         * note.
         */
        module.directive('sticky', function($document) {
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

                    updateUI();

                    // Add a draggable zone
                    var draggableZone = angular.element(element[0].querySelector('.draggable'));
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
                    var informationZone = angular.element(element[0].querySelector('.note-bottom'));
                    var buttonZone = angular.element(element[0].querySelector('.note-top-button'));

                    manageDisplay(informationZone, "none");
                    manageDisplay(buttonZone, "none");

                    element.on('mouseenter', function(event) {
                        manageDisplay(informationZone, "block");
                        manageDisplay(buttonZone, "block");
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

                        scope.n.x = x;
                        scope.n.y = y;

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
                            "left" : x + "px"
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
        });

        /**
         * Directive to create a board to display sticky notes. This directive
         * manage the background.
         */
        module.directive('board', function() {
            return {
                restrict : 'E',
                transclude : true,
                replace : true,
                template : '<div><div ng-transclude></div></div>',
                link : function(scope, element, attr) {
                    scope.$watch("wall", function() {
                        element.css({
                            "position" : "relative",
                            "display" : "block",
                            "background-repeat" : "no-repeat",
                            "background-position" : "center fixed",
                            "background-size" : "cover",
                            "background-image" : "url(" + scope.wall.background + ")"
                        });
                    });
                }
            }
        });
    }
};
