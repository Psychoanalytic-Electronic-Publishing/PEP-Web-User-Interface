import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import SidebarService from 'pep/services/sidebar';
import FastbootMediaService from 'pep/services/fastboot-media';
import ConfigurationService from 'pep/services/configuration';

export default class Index extends Controller {
    @service sidebar!: SidebarService;
    @service fastbootMedia!: FastbootMediaService;
    @service configuration!: ConfigurationService;

    /**
     * Open the search form sidebar
     */
    @action
    showSearch() {
        return this.sidebar.toggleLeftSidebar(true);
    }

    /**
     * Opens login modal (if user is not logged in already)
     * and then transitions to the document read page
     */
    @action
    readExpertPick() {
        //TODO (same as search preview pane logic)
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        index: Index;
    }
}
