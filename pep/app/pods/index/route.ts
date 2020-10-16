import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import Application from 'pep/pods/application/controller';
import IndexController from 'pep/pods/index/controller';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import { copySearchToController } from 'pep/utils/search';

import Search from '../search/controller';

export default class Index extends Route {
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;

    /**
     * Returns the expert pick of the day abstract
     */
    model() {
        const expertPicks = this.configuration.base.home.expertPicks;
        return this.store.findRecord('abstract', expertPicks[expertPicks.length - 1].articleId);
    }

    /**
     * Reset the application controller's search form to the latest search
     * @param {IndexController} controller
     * @param {Object} model
     */
    setupController(controller: IndexController, model: object) {
        super.setupController(controller, model);
        const appController = this.controllerFor('application') as Application;
        const searchController = this.controllerFor('search') as Search;

        copySearchToController(appController, searchController);
    }
}
