import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import copy from 'lodash.clonedeep';

import Application from 'pep/pods/application/controller';
import IndexController from 'pep/pods/index/controller';
import ConfigurationService from 'pep/services/configuration';
import { SEARCH_DEFAULT_VIEW_PERIOD, SEARCH_DEFAULT_TERMS } from 'pep/constants/search';

export default class Index extends Route {
    @service configuration!: ConfigurationService;

    /**
     * Returns the expert pick of the day abstract
     */
    model() {
        return this.store.findRecord('abstract', this.configuration.base.home.expertPicks[0].articleId);
    }

    /**
     * Reset the application controller's search form when returning to the home page
     * @param {IndexController} controller
     * @param {Object} model
     */
    setupController(controller: IndexController, model: object) {
        super.setupController(controller, model);
        const appController = this.controllerFor('application') as Application;
        appController.smartSearchTerm = '';
        appController.matchSynonyms = false;
        appController.citedCount = '';
        appController.viewedCount = '';
        appController.viewedPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
        appController.isLimitOpen = false;
        // create a copy of the default search terms objects so they can be mutated
        appController.searchTerms = copy(SEARCH_DEFAULT_TERMS);
    }
}
