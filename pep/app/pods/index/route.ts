import Route from '@ember/routing/route';
import Application from '../application/controller';

export default class Index extends Route {
    setupController(controller, model) {
        super.setupController(controller, model);
        const appController = this.controllerFor('application') as Application;
        appController.clearSearch();
        //TODO reset search form data in application controller here
        //(to clear it when returning to the homepage)
    }
}
