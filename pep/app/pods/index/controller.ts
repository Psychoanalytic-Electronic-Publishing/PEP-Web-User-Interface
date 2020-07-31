import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Sidebar from 'pep/services/sidebar';
import FastbootMediaService from 'pep/services/fastboot-media';

export default class Index extends Controller {
    @service sidebar!: Sidebar;
    @service fastbootMedia!: FastbootMediaService;

    /**
     * Open the search form sidebar
     */
    @action
    showSearch() {
        return this.sidebar.toggleLeftSidebar(true);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        index: Index;
    }
}
