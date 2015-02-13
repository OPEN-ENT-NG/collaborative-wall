var collaborativeWallExtension = {
    addDirectives : function(module) {

        /**
         * Directive to display sticky note. This directive allows to move the
         * note.
         */
        module.directive('sticky', function($document) {
            return {
                restrict : 'E',
                transclude: true,
                replace: true,
                template: '<div><div ng-transclude></div></div>',
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

                    // Information zone
                    var informationZone = angular.element(element[0].querySelector('.note-bottom'));
                    if (informationZone) {
                        informationZone.css({
                            "display" : "none"
                        });

                        element.on('mouseenter', function(event) {
                            informationZone.css({
                                "display" : "block"
                            });
                        });

                        element.on('mouseleave', function(event) {
                            informationZone.css({
                                "display" : "none"
                            });
                        });
                    }

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
                transclude: true,
                replace: true,
                template: '<div><div ng-transclude></div></div>',
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
