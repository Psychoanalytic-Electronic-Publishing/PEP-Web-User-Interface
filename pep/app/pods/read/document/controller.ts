import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';
import FastbootService from 'ember-cli-fastboot/services/fastboot';

import { PreferenceKey } from 'pep/constants/preferences';
import { SEARCH_DEFAULT_VIEW_PERIOD, SearchSort, ViewPeriod } from 'pep/constants/search';
import Document from 'pep/pods/document/model';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import { buildSearchQueryParams } from 'pep/utils/search';
import { reject } from 'rsvp';

import { SearchSorts, SearchViews, SearchViewType } from '../../../constants/search';

export default class ReadDocument extends Controller {
    @service('pep-session') session!: PepSessionService;
    @service auth!: AuthService;
    @service fastboot!: FastbootService;
    @service loadingBar!: LoadingBarService;
    @service router!: RouterService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;

    @tracked selectedView = SearchViews[1];
    @tracked selectedSort = SearchSorts[0];

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    queryParams = [
        'q',
        { _searchTerms: 'searchTerms' },
        'matchSynonyms',
        'citedCount',
        'viewedCount',
        'viewedPeriod',
        { _facets: 'facets' }
    ];

    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked citedCount: string = '';
    @tracked viewedCount: string = '';
    @tracked viewedPeriod: ViewPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
    @tracked _searchTerms: string | null = null;
    @tracked paginator!: Pagination<Document>;
    @tracked showHitsInContext = false;

    readLaterKey = PreferenceKey.READ_LATER;
    favoritesKey = PreferenceKey.FAVORITES;
    tableView = SearchViewType.TABLE;
    searchViews = SearchViews;
    sorts = SearchSorts;

    get isLoadingRoute(): boolean {
        return /loading$/.test(this.router.currentRouteName);
    }

    get defaultSearchParams() {
        return this.configuration.defaultSearchParams;
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
     * Opens the login modal dialog
     * @param {Event} event
     */
    @action
    login(event: Event) {
        event.preventDefault();
        return this.auth.openLoginModal(true, {
            actions: {
                onAuthenticated: this.onAuthenticated
            }
        });
    }

    /**
     * Reload the document now that the user is logged in
     */
    @action
    async onAuthenticated() {
        try {
            this.loadingBar.show();
            const model = await this.store.findRecord('document', this.model.id, { reload: true });
            set(this, 'model', model);
            this.loadingBar.hide();
            return model;
        } catch (err) {
            this.loadingBar.hide();
            return reject(err);
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
     * Update whether to show hits in context or not
     *
     * @param {boolean} value
     * @memberof Search
     */
    @action
    async updateHitsInContext(value: boolean) {
        // Load more models to make up for the difference in height between displaying HIC and not
        // so the user doesn't see a blank white space
        if (!value) {
            await this.paginator.loadMoreModels();
        }
        this.currentUser.updatePrefs({ [PreferenceKey.SEARCH_HIC_ENABLED]: value });
    }

    /**
     * Update the sort for the list
     *
     * @param {HTMLElementEvent<HTMLSelectElement>} event
     * @memberof Search
     */
    @action
    updateSort(event: HTMLElementEvent<HTMLSelectElement>) {
        const id = event.target.value as SearchSort;
        const selectedSort = SearchSorts.find((item) => item.id === id);
        this.selectedSort = selectedSort!;
        this.paginator.changeSorting([
            {
                valuePath: id,
                isAscending: true
            }
        ]);
    }

    @action
    loadDocument() {
        // @route="read.document"
        // @model={{result.id}}
        // @query={{hash
        //     q=this.q
        //     matchSynonyms=this.matchSynonyms
        //     searchTerms=this._searchTerms
        // }}
        // class="{{if (eq result.id this.model.id) "font-weight-bold"}}"
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        readDocument: ReadDocument;
    }
}
