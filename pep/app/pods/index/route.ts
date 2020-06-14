import Route from '@ember/routing/route';
import Application from '../application/controller';

export default class Index extends Route {
    setupController(controller, model) {
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
