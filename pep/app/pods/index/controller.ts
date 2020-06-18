import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Sidebar from 'pep/services/sidebar';

export default class Index extends Controller {
    @service sidebar!: Sidebar;
    @service media;

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
