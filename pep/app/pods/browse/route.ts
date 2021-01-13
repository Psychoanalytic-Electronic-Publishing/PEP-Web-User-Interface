import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { buildQueryParams, removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';
import MediaService from 'ember-responsive/services/media';

import { GW_VOLUME_DOCUMENT_ID, SE_VOLUME_DOCUMENT_ID } from 'pep/constants/books';
import { PageNav } from 'pep/mixins/page-layout';
import BrowseController from 'pep/pods/browse/controller';
import Document from 'pep/pods/document/model';
import SidebarService from 'pep/services/sidebar';
import { hash } from 'rsvp';

export default class Browse extends PageNav(Route) {
    @service sidebar!: SidebarService;
    @service media!: MediaService;
    navController = 'browse';

    model() {
        return hash({
            gw: this.store.findRecord('document', GW_VOLUME_DOCUMENT_ID),
            se: this.store.findRecord('document', SE_VOLUME_DOCUMENT_ID)
        });
    }

    async setupController(controller: BrowseController, model: { gw: Document; se: Document }) {
        super.setupController(controller, model);
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('browse'),
            pagingRootKey: null,
            filterRootKey: null,
            limit: 1000
        });

        const browseResults = await hash({
            videos: this.store.query('video', {
                ...removeEmptyQueryParams(apiQueryParams),
                streams: false
            }),
            books: this.store.query('book', removeEmptyQueryParams(apiQueryParams)),
            journals: this.store.query('journal', removeEmptyQueryParams(apiQueryParams))
        });

        controller.journals = browseResults.journals.toArray();
        controller.books = browseResults.books.toArray();
        controller.videos = browseResults.videos.toArray();

        if (this.media.isMobile) {
            this.sidebar.toggleLeftSidebar();
        }
    }
}
