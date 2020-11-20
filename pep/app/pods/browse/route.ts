import Route from '@ember/routing/route';
import { later } from '@ember/runloop';

import { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams, removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { GW_VOLUME_DOCUMENT_ID, SE_VOLUME_DOCUMENT_ID } from 'pep/constants/books';
import { PageNav } from 'pep/mixins/page-layout';
import BrowseController from 'pep/pods/browse/controller';
import Journal from 'pep/pods/journal/model';
import { hash } from 'rsvp';

export default class Browse extends PageNav(Route) {
    navController = 'browse';

    async setupController(controller: BrowseController, model: RecordArrayWithMeta<Journal>) {
        super.setupController(controller, model);
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('browse'),
            pagingRootKey: null,
            filterRootKey: null,
            limit: 1000
        });

        const browseResults = await hash({
            journals: this.store.query('journal', removeEmptyQueryParams(apiQueryParams)),
            gw: this.store.findRecord('document', GW_VOLUME_DOCUMENT_ID),
            se: this.store.findRecord('document', SE_VOLUME_DOCUMENT_ID)
        });
        later(async () => {
            const videos = await this.store.query('video', {
                ...removeEmptyQueryParams(apiQueryParams),
                streams: false
            }); //streams: false
            controller.videos = videos.toArray().sortBy('id');
        }, 10000);
        later(async () => {
            const books = await this.store.query('book', removeEmptyQueryParams(apiQueryParams));
            controller.books = books.toArray();
        }, 5000);

        controller.journals = browseResults.journals.toArray();
        controller.gw = browseResults.gw;
        controller.se = browseResults.se;
    }
}
