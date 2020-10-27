import Controller from '@ember/controller';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import Application from 'pep/pods/application/controller';
import CurrentUserService from 'pep/services/current-user';
import { copySearchToController } from 'pep/utils/search';

export default class ReadIndex extends Route {
    @service currentUser!: CurrentUserService;
    /**
     * Reset the application controller's search form to the latest search
     * @param {IndexController} controller
     * @param {Object} model
     */
    setupController(controller: Controller, model: object) {
        super.setupController(controller, model);
        const appController = this.controllerFor('application') as Application;

        copySearchToController(appController);
    }

    redirect(model: any, transition: Transition) {
        if (transition.to.name === this.routeName && this.currentUser.lastViewedDocumentId) {
            this.transitionTo('read.document', this.currentUser.lastViewedDocumentId);
        }
    }
}
