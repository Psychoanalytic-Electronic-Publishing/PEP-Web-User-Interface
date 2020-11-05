import Controller from '@ember/controller';
import { action, setProperties } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export enum BrowseTabs {
    JOURNALS = 'journals',
    BOOKS = 'books',
    VIDEOS = 'videos'
}
export default class Browse extends Controller {
    @tracked tab = BrowseTabs.JOURNALS;
    tabs = BrowseTabs;

    @action
    changeTab(tab: BrowseTabs) {
        this.tab = tab;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        browse: Browse;
    }
}
