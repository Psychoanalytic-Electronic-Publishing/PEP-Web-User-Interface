import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Sidebar from 'pep/services/sidebar';

export default class Application extends Controller {
    @service sidebar!: Sidebar;

    @action
    toggleLeftSidebar() {
        this.sidebar.toggleLeftSidebar();
    }

    @action
    toggleRightSidebar() {
        this.sidebar.toggleRightSidebar();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        application: Application;
    }
}
