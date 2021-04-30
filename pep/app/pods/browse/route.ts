import ArrayProxy from '@ember/array/proxy';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import MediaService from 'ember-responsive/services/media';

import { buildQueryParams, removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { PageNav } from 'pep/mixins/page-layout';
import Book from 'pep/pods/book/model';
import BrowseController from 'pep/pods/browse/controller';
import Document from 'pep/pods/document/model';
import Journal from 'pep/pods/journal/model';
import Video from 'pep/pods/video/model';
import SidebarService from 'pep/services/sidebar';
import { hash } from 'rsvp';

export interface BrowseModel {
    gw: Document;
    se: Document;
    videos: ArrayProxy<Video>;
    books: ArrayProxy<Book>;
    journals: ArrayProxy<Journal>;
}

export default class Browse extends PageNav(Route) {
    @service sidebar!: SidebarService;
    @service media!: MediaService;
    navController = 'browse';

    model() {
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('browse'),
            pagingRootKey: null,
            filterRootKey: null,
            limit: 1000
        });
        return hash({
            videos: this.store.query('video', {
                ...removeEmptyQueryParams(apiQueryParams),
                streams: false
            }),
            books: this.store.query('book', removeEmptyQueryParams(apiQueryParams)),
            journals: this.store.query('journal', removeEmptyQueryParams(apiQueryParams))
        });
    }

    async setupController(controller: BrowseController, model: BrowseModel, transition: Transition) {
        super.setupController(controller, model, transition);

        controller.journals = model.journals.toArray() ?? [];
        controller.books = model.books.toArray() ?? [];
        controller.videos = model.videos.toArray().sortBy('displayTitle') ?? [];

        if (this.media.isMobile) {
            this.sidebar.toggleLeftSidebar();
        }
    }
}
