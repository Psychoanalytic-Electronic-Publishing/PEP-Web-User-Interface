import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import Application from 'pep/pods/application/controller';
import IndexController from 'pep/pods/index/controller';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import { SEARCH_DEFAULT_VIEW_PERIOD } from 'pep/constants/search';

export default class Index extends Route {
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;

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
        const appController = this.controllerFor('application') as Application;
        const cfg = this.configuration.base.search;
        const prefs = this.currentUser.preferences;
        const terms = prefs?.searchTermFields ?? cfg.terms.defaultFields;
        const isLimitOpen = prefs?.searchLimitIsShown ?? cfg.limitFields.isShown;

        appController.smartSearchTerm = '';
        appController.matchSynonyms = false;
        appController.citedCount = '';
        appController.viewedCount = '';
        appController.viewedPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
        appController.isLimitOpen = isLimitOpen;
        appController.searchTerms = terms.map((f) => ({ type: f, term: '' }));
    }
}
