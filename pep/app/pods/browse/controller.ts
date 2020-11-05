import Controller from '@ember/controller';
import { action, setProperties } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';

import Journal from 'pep/pods/journal/model';

export enum BrowseTabs {
    JOURNALS = 'journals',
    BOOKS = 'books',
    VIDEOS = 'videos'
}
export default class Browse extends Controller {
    @tracked tab = BrowseTabs.JOURNALS;
    @tracked journals!: Pagination<Journal>;
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
