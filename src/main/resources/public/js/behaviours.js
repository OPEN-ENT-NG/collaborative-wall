/**
 * Define rights for behaviours.
 */
var wallBehaviours = {

    /**
     * Resources set by the user.
     */
    resources : {
        contrib : {
            right : 'net-atos-entng-collaborativewall-controllers-CollaborativeWallController|vote'
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
        create : 'net.atos.entng.collaborativewall.controllers.CollaborativeWallController|create'
    },

    /**
     * Special rights for the sniplet part.
     */
    viewRights : [ "net-atos-entng-collaborativewall-controllers-CollaborativeWallController|list" ]
};

/**
 * Register behaviours.
 */
Behaviours.register('wall', {
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
    }
});