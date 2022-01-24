import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import { IJP_OPEN_CODE } from 'pep/constants/books';
import {
    NEXT_ARTICLE,
    NEXT_ARTICLE_FIRST_HIT,
    NEXT_HIT,
    PREVIOUS_ARTICLE,
    PREVIOUS_ARTICLE_FIRST_HIT,
    PREVIOUS_HIT,
} from 'pep/constants/keyboard-shortcuts';
import { PreferenceKey, UserPreferences } from 'pep/constants/preferences';
import { SEARCH_DEFAULT_VIEW_PERIOD, SearchView, SearchViews, SearchViewType, ViewPeriod } from 'pep/constants/search';
import { KeyboardShortcut } from 'pep/modifiers/register-keyboard-shortcuts';
import Abstract from 'pep/pods/abstract/model';
import Document from 'pep/pods/document/model';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import { SearchPreviewModeId } from 'pep/services/preview-pane';
import { buildSearchQueryParams } from 'pep/utils/search';
import { SearchSorts, transformSearchSortToAPI } from 'pep/utils/sort';
import { guard } from 'pep/utils/types';
import { reject } from 'rsvp';

export default class SearchRead extends Controller {
    @service declare loadingBar: LoadingBarService;
    @service declare configuration: ConfigurationService;
    @service declare currentUser: CurrentUserService;
    @service('pep-session') declare session: PepSessionService;

    pagingLimit = 20;
    afterDocumentRendered: null | (() => void) = null;
    tableView = SearchViewType.TABLE;
    searchViews = SearchViews;
    sorts = SearchSorts;

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    queryParams = [
        'q',
        {
            page: {
                scope: 'controller'
            }
        },
        { _searchTerms: 'searchTerms' },
        'matchSynonyms',
        'citedCount',
        'viewedCount',
        'viewedPeriod',
        { _facets: 'facets' },
        'preview',
        'index'
    ];

    @tracked selectedView = SearchViews[0];
    @tracked selectedSort = SearchSorts[0];
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked citedCount: string = '';
    @tracked viewedCount: string = '';
    @tracked viewedPeriod: ViewPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
    @tracked _searchTerms: string | null = null;
    @tracked paginator!: Pagination<Document>;
    @tracked page: string | null = null;
    @tracked searchHitNumber?: number;
    @tracked index: number = this.pagingLimit;
    @tracked containerMaxHeight = 0;

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
        },
        {
            keys: NEXT_HIT,
            shortcut: this.viewNextSearchHit
        },
        {
            keys: PREVIOUS_HIT,
            shortcut: this.viewPreviousSearchHit
        },
        {
            keys: NEXT_ARTICLE_FIRST_HIT,
            shortcut: async () => {
                await this.loadNextDocumentInListIfAvailable();
                this.afterDocumentRendered = this.viewNextSearchHit;
            }
        },
        {
            keys: PREVIOUS_ARTICLE_FIRST_HIT,
            shortcut: async () => {
                await this.loadPreviousDocumentInListIfAvailable();
                this.afterDocumentRendered = this.viewNextSearchHit;
            }
        }
    ];

    get hasDiscussionEnabled() {
        return this.document?.PEPCode === IJP_OPEN_CODE;
    }

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

    get readQueryParams() {
        return {
            q: this.q,
            searchTerms: this._searchTerms,
            facets: this._facets,
            matchSynonyms: this.matchSynonyms,
            citedCount: this.citedCount,
            viewedCount: this.viewedCount,
            index: this.index
        };
    }

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    @tracked _facets: string | null = JSON.stringify([]);
    get facets() {
        if (!this._facets) {
            return [];
        } else {
            return JSON.parse(this._facets);
        }
    }
    set facets(array) {
        if (Array.isArray(array) && array.length > 0) {
            this._facets = JSON.stringify(array);
        } else {
            this._facets = null;
        }
    }

    get lastPage() {
        //TODO get from metadata
        return 5;
    }

    get searchTerms() {
        if (!this._searchTerms) {
            return [];
        } else {
            return JSON.parse(this._searchTerms);
        }
    }
    set searchTerms(array) {
        if (Array.isArray(array) && array.length > 0) {
            this._searchTerms = JSON.stringify(array);
        } else {
            this._searchTerms = null;
        }
    }

    /**
     * Show or hide right arrow for search hits
     *
     * @readonly
     * @memberof ReadDocument
     */
    get showNextSearchHitButton() {
        return this.searchHitNumber === undefined || this.searchHitNumber < (this.document?.termCount ?? 0);
    }

    /**
     * Sets up the session authenticated to refresh the document
     *
     * @memberof SearchRead
     */
    setup() {
        this.session.on('authenticationAndSetupSucceeded', this.onAuthenticated);
    }

    /**
     * Removes the auth succeeded event listener on destroy of controller
     */
    willDestroy() {
        super.willDestroy();
        this.session.off('authenticationAndSetupSucceeded', this.onAuthenticated);
    }

    /**
     * Load next document in left sidebar list
     *
     * @return {*}  {Promise<void>}
     * @memberof SearchRead
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
     * @memberof SearchRead
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
        if (this.selectedView.id === SearchViewType.TABLE) {
            return transformSearchSortToAPI(sorts);
        } else {
            return sorts;
        }
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
        const cfg = this.configuration.base.search;
        const searchParams = buildSearchQueryParams({
            smartSearchTerm: this.q,
            searchTerms: this.searchTerms,
            synonyms: this.matchSynonyms,
            facetValues: this.facets,
            citedCount: this.citedCount,
            viewedCount: this.viewedCount,
            viewedPeriod: this.viewedPeriod,
            facetFields: cfg.facets.defaultFields,
            joinOp: 'AND',
            facetLimit: cfg.facets.valueLimit,
            facetMinCount: cfg.facets.valueMinCount,
            highlightlimit: this.currentUser.preferences?.searchHICLimit ?? cfg.hitsInContext.limit
        });

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
     * Update which view to show - table or list
     *
     * @param {HTMLElementEvent<HTMLSelectElement>} event
     * @memberof Search
     */
    @action
    updateSelectedView(selectedView: SearchView) {
        this.selectedView = selectedView;
    }

    /**
     * Navigate to the passed in document
     *
     * @param {Document} document
     * @memberof ReadDocument
     */
    @action
    loadDocument(abstract: Abstract | string) {
        let id = abstract;
        if (guard<Abstract>(abstract, 'id')) {
            id = abstract.id;
        }

        this.transitionToRoute('search.read', id, {
            queryParams: {
                q: this.q,
                matchSynonyms: this.matchSynonyms,
                searchTerms: this._searchTerms,
                index: this.index
            }
        });
    }

    /**
     * View next search hit item
     *
     * @memberof ReadDocument
     */
    @action
    viewNextSearchHit() {
        if (this.showNextSearchHitButton) {
            this.searchHitNumber = this.searchHitNumber ? this.searchHitNumber + 1 : 1;
        }
    }

    /**
     * View previous search hit item
     *
     * @memberof ReadDocument
     */
    @action
    viewPreviousSearchHit() {
        if (this.searchHitNumber === 1) {
            this.searchHitNumber = undefined;
        } else if (this.searchHitNumber) {
            this.searchHitNumber = this.searchHitNumber - 1;
        }
    }

    /**
     * Set the search hit number to the next number. Most likely its the same number they were on, so make it undefined first
     *
     * @param {number} number
     * @memberof SearchRead
     */
    @action
    viewSearchHitNumber(number: number) {
        this.searchHitNumber = undefined;
        this.searchHitNumber = number;
    }

    /**
     * Document was rendered, so now we need to call the afterDocumentRendered function we saved
     *
     * @memberof SearchRead
     */
    @action
    documentRendered() {
        this.afterDocumentRendered?.();
        this.afterDocumentRendered = null;
    }

    /**
     * Update the page when the scroll changes
     *
     * @param {string} page
     * @memberof SearchRead
     */
    @action
    viewablePageUpdate(page: string) {
        this.page = page;
    }

    /**
     * Toggle comments visibility
     *
     * @memberof SearchRead
     */
    @action
    toggleComments() {
        this.currentUser.updatePrefs({
            [PreferenceKey.COMMENTS_ENABLED]: !this.currentUser.preferences?.commentsEnabled
        });
    }

    /**
     * On height change, save it to the preferences
     *
     * @param {number} height
     * @memberof BrowseRead
     */
    @action
    onPanelChange(id: SearchPreviewModeId, height?: number) {
        const updates: Partial<UserPreferences> = {};
        updates[PreferenceKey.COMMENTS_PANEL_MODE] = id;
        if (height) {
            updates[PreferenceKey.COMMENTS_PANEL_HEIGHT] = height;
        }

        this.currentUser.updatePrefs(updates);
    }

    /**
     * Sets the max height of the search preview pane
     * @param {HTMLElement} element
     */
    @action
    updateContainerMaxHeight(element: HTMLElement) {
        this.containerMaxHeight = element.offsetHeight - 100;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'search/read': SearchRead;
    }
}
