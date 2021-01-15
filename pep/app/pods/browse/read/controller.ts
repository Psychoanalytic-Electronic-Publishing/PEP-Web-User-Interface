import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import { SearchView, SearchViews, SearchViewType } from 'pep/constants/search';
import Document from 'pep/pods/document/model';
import LoadingBarService from 'pep/services/loading-bar';
import { buildSearchQueryParams } from 'pep/utils/search';
import { SearchSorts, transformSearchSortToAPI } from 'pep/utils/sort';
import { reject } from 'rsvp';

export default class BrowseRead extends Controller {
    @service loadingBar!: LoadingBarService;

    @tracked selectedView = SearchViews[0];
    @tracked paginator!: Pagination<Document>;
    @tracked page = null;

    // This becomes our model as the template wasn't updating when we changed the default model
    @tracked document?: Document;

    queryParams = ['page'];

    tableView = SearchViewType.TABLE;
    searchViews = SearchViews;
    sorts = SearchSorts;

    get relatedDocumentQueryParams() {
        const smartSearchTerm = this.model.id.split('.');
        return buildSearchQueryParams({
            smartSearchTerm: `${smartSearchTerm[0]}.${smartSearchTerm[1]}.*`
        });
    }

    /**
     * Transform the sorting to a format the API can handle
     *
     * @param {string[]} sorts
     * @returns
     * @memberof Search
     */
    @action
    async onChangeSorting(sorts: string[]) {
        return transformSearchSortToAPI(sorts);
    }

    /**
     * Process query params
     *
     * @param {QueryParamsObj} params
     * @returns
     * @memberof ReadDocument
     */
    @action
    processQueryParams(params: QueryParamsObj) {
        const searchParams = this.relatedDocumentQueryParams;
        return { ...params, ...searchParams };
    }

    /**
     * Reload the document now that the user is logged in
     */
    @action
    async onAuthenticated() {
        if (this.document?.id) {
            try {
                this.loadingBar.show();
                const document = await this.store.findRecord('document', this.document?.id, { reload: true });
                this.document = document;
                this.loadingBar.hide();
                return document;
            } catch (err) {
                this.loadingBar.hide();
                return reject(err);
            }
        } else {
            return reject();
        }
    }

    /**
     * Navigate to the passed in document
     *
     * @param {Document} document
     * @memberof ReadDocument
     */
    @action
    loadDocument(document: Document) {
        this.transitionToRoute('browse.read', document.id);
    }

    /**
     * Update which view to show - table or list
     *
     * @param {HTMLElementEvent<HTMLSelectElement>} event
     * @memberof Search
     */
    @action
    updateSelectedView(view: SearchView) {
        this.selectedView = view;
    }
}
// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse/read': BrowseRead;
    }
}
