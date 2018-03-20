import { ng, model } from 'entcore';
import { Mix } from 'entcore-toolkit';
import http from 'axios';

import { collaborativewall } from './model';
import { stickyDirective, sglclickDirective, boardDirective } from './directives';
import { wallController } from './controller';

declare let module: any;

ng.controllers.push(wallController);
ng.directives.push(stickyDirective);
ng.directives.push(sglclickDirective);
ng.directives.push(boardDirective);

/**
 * Allows to create a model and load the list of walls from the backend.
 */
model.build = function() {    
    this.makeModels(collaborativewall);
    
    this.collection(collaborativewall.Wall, {
            sync: function(callback){
            http.get('/collaborativewall/list/all').then(function(walls){

                this.load(walls.data);
                if(typeof callback === 'function'){
                    callback();
                }
            }.bind(this));
        },
        behaviours: 'collaborativewall'
    });
};