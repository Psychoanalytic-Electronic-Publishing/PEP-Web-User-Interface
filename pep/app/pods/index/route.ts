import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import Application from 'pep/pods/application/controller';
import IndexController from 'pep/pods/index/controller';
import ConfigurationService from 'pep/services/configuration';

export default class Index extends Route {
    @service configuration!: ConfigurationService;

    /**
     * Returns the expert pick of the day abstract
     */
    model() {
        return this.store.findRecord('abstract', this.configuration.base.home.expertPick.articleId);
    }

    /**
     *
     * @param {IndexController} controller
     * @param {Object} model
     */
    setupController(controller: IndexController, model: object) {
        super.setupController(controller, model);
        //reset the homepage search form when returning,
        const appController = this.controllerFor('application') as Application;
        appController.smartSearchTerm = '';
        appController.matchSynonyms = false;
        appController.searchTerms = [
            { type: 'everywhere', term: '' },
            { type: 'title', term: '' },
            { type: 'author', term: '' }
        ];
    }
}
