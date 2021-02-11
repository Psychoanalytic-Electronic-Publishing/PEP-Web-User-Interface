import Controller from '@ember/controller';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import Application from 'pep/pods/application/controller';
import { copySearchToController } from 'pep/utils/search';

export default class Index extends Route {
    /**
     * Reset the application controller's search form to the latest search
     * @param {IndexController} controller
     * @param {Object} model
     */
    setupController(controller: Controller, model: object, transition: Transition) {
        super.setupController(controller, model, transition);
        const appController = this.controllerFor('application') as Application;

        copySearchToController(appController);
    }
}
