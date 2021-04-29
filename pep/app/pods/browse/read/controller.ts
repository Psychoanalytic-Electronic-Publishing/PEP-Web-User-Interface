import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import { NEXT_ARTICLE, PREVIOUS_ARTICLE } from 'pep/constants/keyboard-shortcuts';
import { SearchView, SearchViews, SearchViewType } from 'pep/constants/search';
import { KeyboardShortcut } from 'pep/modifiers/register-keyboard-shortcuts';
import Document from 'pep/pods/document/model';
import LoadingBarService from 'pep/services/loading-bar';
import { buildBrowseRelatedDocumentsParams, buildSearchQueryParams } from 'pep/utils/search';
import { SearchSorts, transformSearchSortToAPI } from 'pep/utils/sort';
import { guard } from 'pep/utils/types';
import { reject } from 'rsvp';

export default class BrowseRead extends Controller {
    @service loadingBar!: LoadingBarService;

    tableView = SearchViewType.TABLE;
    searchViews = SearchViews;
    sorts = SearchSorts;
    pagingLimit = 20;
    // @ts-ignore
    queryParams = [
        {
            page: {
                scope: 'controller'
            }
        },
        'index'
    ];

    @tracked selectedView = SearchViews[0];
    @tracked paginator!: Pagination<Document>;
    @tracked page: string | null = null;
    @tracked index: number = this.pagingLimit;

    // This becomes our model as the template wasn't updating when we changed the default model
    @tracked document?: Document;

    @tracked shortcuts: KeyboardShortcut[] = [
        {
            keys: NEXT_ARTICLE,
            shortcut: this.loadNextDocumentInListIfAvailable
        },
        {
            keys: PREVIOUS_ARTICLE,
            shortcut: this.loadPreviousDocumentInListIfAvailable
        }
    ];

    get nextDocumentInList(): Document | undefined {
        const currentDocument = this.document;
        const loadedDocuments = this.paginator.models;
        if (currentDocument) {
            const currentDocumentIndex = loadedDocuments.findIndex((document) => document.id === currentDocument.id);
            const nextDocument = loadedDocuments[currentDocumentIndex + 1];
            return nextDocument;
        }
    }

    get previousDocumentInList(): Document | undefined {
        const currentDocument = this.document;
        const loadedDocuments = this.paginator.models;
        if (currentDocument) {
            const currentDocumentIndex = loadedDocuments.findIndex((document) => document.id === currentDocument.id);
            const nextDocument = loadedDocuments[currentDocumentIndex - 1];
            return nextDocument;
        }
    }

    get relatedDocumentQueryParams() {
        const params = buildBrowseRelatedDocumentsParams(this.model);
        return buildSearchQueryParams(params);
    }

    /**
     * Load next document in left sidebar list
     *
     * @return {*}  {Promise<void>}
     * @memberof BrowseRead
     */
    @action
    async loadNextDocumentInListIfAvailable(): Promise<void> {
        if (this.nextDocumentInList) {
            this.loadDocument(this.nextDocumentInList.id);
        } else {
            const results = await this.paginator.loadMoreModels();
            if (results && results.length !== 0) {
                this.loadNextDocumentInListIfAvailable();
            }
        }
    }
    /**
     * Load previous document in left sidebar list
     *
     * @memberof BrowseRead
     */
    @action
    loadPreviousDocumentInListIfAvailable(): void {
        if (this.previousDocumentInList) {
            this.loadDocument(this.previousDocumentInList);
        }
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
        this.index = this.paginator.models.length;
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
     *  Navigate to the passed in document
     *
     * @param {(Document | string)} abstract
     * @memberof BrowseRead
     */
    @action
    loadDocument(abstract: Document | string) {
        let id = abstract;
        if (guard<Document>(abstract, 'id')) {
            id = abstract.id;
        }
        this.transitionToRoute('browse.read', id, {
            queryParams: {
                index: this.index
            }
        });
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

    /**
     * Update page query param. This happens as the document is scrolled
     *
     * @param {string} page
     * @memberof BrowseRead
     */
    @action
    viewablePageUpdate(page: string) {
        this.page = page;
    }
}
// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse/read': BrowseRead;
    }
}
