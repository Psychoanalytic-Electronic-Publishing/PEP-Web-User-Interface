import Route from '@ember/routing/route';

import BrowseController, { BrowseTabs } from 'pep/pods/browse/controller';
import { BrowseJournalParams } from 'pep/pods/browse/journal/route';

export default class BrowseBookVolumes extends Route {
    async model(params: BrowseJournalParams) {
        const book = await this.store.query('book', { sourcecode: params.pep_code });
        return book.firstObject;
    }

    setupController() {
        const browseController = this.controllerFor('browse') as BrowseController;
        browseController.tab = BrowseTabs.BOOKS;
    }
}
