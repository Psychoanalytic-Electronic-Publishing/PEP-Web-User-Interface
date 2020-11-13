import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';

import Source from 'pep/pods/source/model';

export default class BrowseJournal extends Controller {
    @tracked paginator!: Pagination<Source>;
    @tracked sourceCode?: string;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse/journal': BrowseJournal;
    }
}
