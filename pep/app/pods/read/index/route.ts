import Controller from '@ember/controller';
import Route from '@ember/routing/route';

import Application from 'pep/pods/application/controller';
import Search from 'pep/pods/search/controller';
import { copySearchToController } from 'pep/utils/search';

export default class ReadIndex extends Route {
    /**
     * Reset the application controller's search form to the latest search
     * @param {IndexController} controller
     * @param {Object} model
     */
    setupController(controller: Controller, model: object) {
        super.setupController(controller, model);
        const appController = this.controllerFor('application') as Application;
        const searchController = this.controllerFor('search') as Search;

        copySearchToController(appController, searchController);
    }
}
