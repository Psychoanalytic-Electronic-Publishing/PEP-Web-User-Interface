import Route from '@ember/routing/route';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams, removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { PageNav } from 'pep/mixins/page-layout';
import Book from 'pep/pods/book/model';
import BrowseController from 'pep/pods/browse/controller';
import Journal from 'pep/pods/journal/model';
import Video from 'pep/pods/video/model';
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
            videos: this.store.query('video', removeEmptyQueryParams(apiQueryParams)),
            books: this.store.query('book', removeEmptyQueryParams(apiQueryParams))
        });

        controller.journals = browseResults.journals.toArray();
        controller.videos = browseResults.videos.toArray();
        controller.books = browseResults.books.toArray();
    }
}
