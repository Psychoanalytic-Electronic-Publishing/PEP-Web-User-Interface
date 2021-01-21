import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';
import MediaService from 'ember-responsive/services/media';

import { SEARCH_DEFAULT_VIEW_PERIOD, SearchViews, SearchViewType, ViewPeriod } from 'pep/constants/search';
import Abstract from 'pep/pods/abstract/model';
import Document from 'pep/pods/document/model';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import { buildSearchQueryParams } from 'pep/utils/search';
import { SearchSorts, transformSearchSortToAPI } from 'pep/utils/sort';
import { reject } from 'rsvp';

export default class SearchRead extends Controller {
    @service loadingBar!: LoadingBarService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;
    @service media!: MediaService;

    @tracked selectedView = SearchViews[0];
    @tracked selectedSort = SearchSorts[0];
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked citedCount: string = '';
    @tracked viewedCount: string = '';
    @tracked viewedPeriod: ViewPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
    @tracked _searchTerms: string | null = null;
    @tracked paginator!: Pagination<Document>;
    @tracked page = null;
    @tracked searchHitNumber?: number;

    // This becomes our model as the template wasn't updating when we changed the default model
    @tracked document?: Document;

    tableView = SearchViewType.TABLE;
    searchViews = SearchViews;
    sorts = SearchSorts;

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    queryParams = [
        'q',
        'page',
        { _searchTerms: 'searchTerms' },
        'matchSynonyms',
        'citedCount',
        'viewedCount',
        'viewedPeriod',
        { _facets: 'facets' },
        'preview'
    ];

    get readQueryParams() {
        return {
            q: this.q,
            searchTerms: this._searchTerms,
            facets: this._facets,
            matchSynonyms: this.matchSynonyms,
            citedCount: this.citedCount,
            viewedCount: this.viewedCount
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
    updateSelectedView(event: HTMLElementEvent<HTMLSelectElement>) {
        const id = event.target.value as SearchViewType;
        const selectedView = SearchViews.find((item) => item.id === id);
        this.selectedView = selectedView!;
    }

    /**
     * Navigate to the passed in document
     *
     * @param {Document} document
     * @memberof ReadDocument
     */
    @action
    loadDocument(abstract: Abstract) {
        this.transitionToRoute('search.read', abstract.id, {
            queryParams: {
                q: this.q,
                matchSynonyms: this.matchSynonyms,
                searchTerms: this._searchTerms
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
        this.searchHitNumber = this.searchHitNumber ? this.searchHitNumber + 1 : 1;
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
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'search/read': SearchRead;
    }
}
