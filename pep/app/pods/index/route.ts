import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import Application from 'pep/pods/application/controller';
import IndexController from 'pep/pods/index/controller';
import ConfigurationService from 'pep/services/configuration';
import { SEARCH_DEFAULT_VIEW_PERIOD } from 'pep/constants/search';

export default class Index extends Route {
    @service configuration!: ConfigurationService;

    /**
     * Returns the expert pick of the day abstract
     */
    model() {
        return this.store.findRecord('abstract', this.configuration.base.home.expertPick.articleId);
    }

    /**
     * Reset the application controller's search form when returning to the home page
     * @param {IndexController} controller
     * @param {Object} model
     */
    setupController(controller: IndexController, model: object) {
        super.setupController(controller, model);
        const cfg = this.configuration.base.search;
        const appController = this.controllerFor('application') as Application;
        appController.smartSearchTerm = '';
        appController.matchSynonyms = false;
        appController.citedCount = '';
        appController.viewedCount = '';
        appController.viewedPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
        // TODO use user's pref value for toggle state instead of default config, if one exists
        appController.isLimitOpen = cfg.limitFields.isShown;
        // TODO use user's pref value for default search terms instead of default config, if one exists
        appController.searchTerms = cfg.terms.defaultFields.map((f) => ({ type: f, term: '' }));
    }
}
