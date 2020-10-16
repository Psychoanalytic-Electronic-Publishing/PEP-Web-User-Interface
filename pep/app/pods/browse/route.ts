import Route from '@ember/routing/route';

import { PageNav } from 'pep/mixins/page-layout';
import { copySearchToController } from 'pep/utils/search';

import Application from '../application/controller';
import Search from '../search/controller';

export default class Browse extends PageNav(Route) {
    //TODO browse will have its own sidebar behavior/logic
    navController = 'application';

    /**
     * Reset the application controller's search form to the latest search
     * @param {IndexController} controller
     * @param {Object} model
     */
    setupController(controller: Application, model: object) {
        super.setupController(controller, model);
        const appController = this.controllerFor('application') as Application;
        const searchController = this.controllerFor('search') as Search;

        copySearchToController(appController, searchController);
    }
}
