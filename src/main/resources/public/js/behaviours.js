/**
 * Define rights for behaviours.
 */
var wallBehaviours = {

    /**
     * Resources set by the user.
     */
    resources : {
        retrieve : {
            right : 'net-atos-entng-collaborativewall-controllers-CollaborativeWallController|retrieve'
        },
        contrib : {
            right : 'net-atos-entng-collaborativewall-controllers-CollaborativeWallController|contribute'
        },
        manage : {
            right : 'net-atos-entng-collaborativewall-controllers-CollaborativeWallController|delete'
        }
    },

    /**
     * Workflow rights are defined by the administrator. This associates a name
     * with a Java method of the server.
     */
    workflow : {
        create : 'net.atos.entng.collaborativewall.controllers.CollaborativeWallController|create',
        print : 'net.atos.entng.collaborativewall.controllers.CollaborativeWallController|print'
    }
};

/**
 * Register behaviours.
 */
Behaviours.register('collaborativewall', {
    behaviours : wallBehaviours,

    /**
     * Allows to set rights for behaviours.
     */
    resource : function(resource) {
        var rightsContainer = resource;
        if (!resource.myRights) {
            resource.myRights = {};
        }

        for ( var behaviour in wallBehaviours.resources) {
            if (model.me.hasRight(rightsContainer, wallBehaviours.resources[behaviour]) || model.me.userId === resource.owner.userId || model.me.userId === rightsContainer.owner.userId) {
                if (resource.myRights[behaviour] !== undefined) {
                    resource.myRights[behaviour] = resource.myRights[behaviour] && wallBehaviours.resources[behaviour];
                } else {
                    resource.myRights[behaviour] = wallBehaviours.resources[behaviour];
                }
            }
        }
        return resource;
    },

    /**
     * Allows to load workflow rights according to rights defined by the
     * administrator for the current user in the console.
     */
    workflow : function() {
        var workflow = {};

        var wallWorkflow = wallBehaviours.workflow;
        for ( var prop in wallWorkflow) {
            if (model.me.hasWorkflow(wallWorkflow[prop])) {
                workflow[prop] = true;
            }
        }

        return workflow;
    },

    /**
     * Allows to define all rights to display in the share windows. Names are
     * defined in the server part with
     * <code>@SecuredAction(value = "xxxx.read", type = ActionType.RESOURCE)</code>
     * without the prefix <code>xxx</code>.
     */
    resourceRights : function() {
        return [ 'read', 'contrib', 'manager' ]
    },

    /**
     * Allows to load all walls to display in the linker.
     * @param callback function to call after load.
     * @return a list of objects containing :
     * <ul>
     * <li>title</li>
     * <li>ownerName</li>
     * <li>owner</li>
     * <li>icon</li>
     * <li>path</li>
     * <li>id</li>
     * </ul>
     */
    loadResources : function(callback) {
        http().get('/collaborativewall/list/all').done(function(walls) {

            this.resources = _.map(walls, function(wall) {
                return {
                    title : wall.name,
                    ownerName : wall.owner.displayName,
                    owner : wall.owner.userId,
                    icon : wall.icon ? wall.icon : '/img/illustrations/collaborative-wall-default.png',
                    path : '/collaborativewall#/view/' + wall._id,
                    id : wall._id
                };
            });

            if (typeof callback === 'function') {
                callback(this.resources);
            }
        }.bind(this));
    }
});