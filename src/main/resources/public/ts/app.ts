import { model, ng } from 'entcore';
import http from 'axios';

import { collaborativewall } from './model';
import { boardDirective, sglclickDirective, stickyDirective } from './directives';
import { wallController } from './controller';
import { IdAndLibraryResourceInformation, LibraryServiceProvider } from "entcore/types/src/ts/library/library.service";

declare let module: any;

interface CollaborativeWall {
    _id: string;
    name: string;
    icon: string;
}

ng.configs.push(ng.config(['libraryServiceProvider', function (libraryServiceProvider: LibraryServiceProvider<CollaborativeWall>) {
    libraryServiceProvider.setPublishUrlGetterFromId(function (id: string) {
        return `/collaborativewall/${id}/library`;
    });
    libraryServiceProvider.setInvokableResourceInformationGetterFromResource(function () {
        return function (resource: CollaborativeWall): IdAndLibraryResourceInformation {
            return {id: resource._id, resourceInformation: {title: resource.name, cover: resource.icon}};
        };
    });
}]));


ng.controllers.push(wallController);
ng.directives.push(stickyDirective);
ng.directives.push(sglclickDirective);
ng.directives.push(boardDirective);

/**
 * Allows to create a model and load the list of walls from the backend.
 */
model.build = function () {
    this.makeModels(collaborativewall);

    this.collection(collaborativewall.Wall, {
        sync: function (callback) {
            http.get('/collaborativewall/list/all').then(function (walls) {

                this.load(walls.data);
                if (typeof callback === 'function') {
                    callback();
                }
            }.bind(this));
        },
        behaviours: 'collaborativewall'
    });
};