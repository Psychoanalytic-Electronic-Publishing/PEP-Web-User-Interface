import Controller from '@ember/controller';
import { action, setProperties } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import { inject as service } from '@ember/service';
import { hash } from 'rsvp';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';
import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { didCancel, timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import cloneDeep from 'lodash.clonedeep';

import AjaxService from 'pep/services/ajax';
import {
    SEARCH_TYPE_EVERYWHERE,
    SearchTermValue,
    SearchFacetValue,
    ViewPeriod,
    SEARCH_DEFAULT_VIEW_PERIOD,
    SEARCH_DEFAULT_TERMS
} from 'pep/constants/search';
import SidebarService from 'pep/services/sidebar';
import LoadingBarService from 'pep/services/loading-bar';
import FastbootMediaService from 'pep/services/fastboot-media';
import Document from 'pep/pods/document/model';
import ScrollableService from 'pep/services/scrollable';
import { buildSearchQueryParams, hasSearchQuery } from 'pep/utils/search';
import { SearchMetadata } from 'pep/api';

export default class Search extends Controller {
    @service ajax!: AjaxService;
    @service sidebar!: SidebarService;
    @service loadingBar!: LoadingBarService;
    @service fastboot!: FastbootService;
    @service fastbootMedia!: FastbootMediaService;
    @service scrollable!: ScrollableService;

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

    @tracked isLimitOpen: boolean = false;
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked citedCount: string = '';
    @tracked viewedCount: string = '';
    @tracked viewedPeriod: ViewPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
    @tracked paginator!: Pagination<Document>;

    @tracked currentSmartSearchTerm: string = '';
    @tracked currentSearchTerms: SearchTermValue[] = [];
    @tracked currentMatchSynonyms: boolean = false;
    @tracked currentCitedCount: string = '';
    @tracked currentViewedCount: string = '';
    @tracked currentViewedPeriod: ViewPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
    @tracked currentFacets: SearchFacetValue[] = [];
    @tracked resultsMeta: SearchMetadata | null = null;

    @tracked previewedResult: Document | null = null;
    @tracked previewMode = 'fit';
    @tracked containerMaxHeight = 0;

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    @tracked _searchTerms: string | null = JSON.stringify(SEARCH_DEFAULT_TERMS);
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

    get hasSubmittedSearch() {
        return this.q || this.searchTerms.filter((t: SearchTermValue) => !!t.term).length > 0;
    }

    get noResults() {
        return !this.paginator.isLoadingModels && (!this.hasSubmittedSearch || !this.paginator.models.length);
    }

    get hasRefineChanges() {
        return JSON.stringify(this.currentFacets) !== JSON.stringify(this.facets);
    }

    /**
     * Process query params
     *
     * @param {QueryParamsObj} params
     * @returns
     * @memberof Search
     */
    @action
    processQueryParams(params: QueryParamsObj) {
        const searchParams = buildSearchQueryParams(
            this.q,
            this.searchTerms,
            this.matchSynonyms,
            this.facets,
            this.citedCount,
            this.viewedCount,
            this.viewedPeriod
        );
        return { ...params, ...searchParams };
    }

    /**
     * Submits the search/nav template's search form
     * @returns Document[]
     */
    @action
    async submitSearch() {
        try {
            //update query params
            this.updateSearchQueryParams();

            //clear any open document preview
            this.closeResultPreview();

            //close overlay sidebar on submit in mobile/tablet
            if (this.fastbootMedia.isSmallDevice) {
                this.sidebar.toggleLeftSidebar();
            }

            //perform search
            this.loadingBar.show();
            this.scrollable.scrollToTop('search-results');
            const results = await hash({
                documents: this.paginator.filterModels(),
                meta: taskFor(this.updateRefineMetadata).perform(false, 0)
            });
            this.loadingBar.hide();
            this.scrollable.recalculate('sidebar-left');
            return results.documents;
        } catch (err) {
            this.loadingBar.hide();
            throw err;
        }
    }

    /**
     * Resubmits the search form with the currently selected facet values
     * @returns {Promise<Document[]>}
     */
    @action
    async resubmitSearchWithFacets(): Promise<Document[]> {
        try {
            this.facets = this.currentFacets;
            this.updateSearchQueryParams();
            this.closeResultPreview();
            this.loadingBar.show();
            const results = await hash({
                documents: this.paginator.filterModels(),
                meta: taskFor(this.updateRefineMetadata).perform(false, 0)
            });
            this.loadingBar.hide();
            return results.documents;
        } catch (err) {
            this.loadingBar.hide();
            throw err;
        }
    }

    /**
     * When facet option selections change, resubmits the search
     * after a short debounce timeout
     */
    @restartableTask
    *resubmitSearchOnFacetsChange() {
        yield timeout(500);
        yield this.resubmitSearchWithFacets();
    }

    /**
     * Updates the query params with the current search form values
     */
    @action
    updateSearchQueryParams() {
        const searchTerms = this.currentSearchTerms.filter((t: SearchTermValue) => !!t.term);
        this.q = this.currentSmartSearchTerm;
        this.searchTerms = !isEmpty(searchTerms) ? searchTerms : null;
        this.matchSynonyms = this.currentMatchSynonyms;
        this.citedCount = this.currentCitedCount;
        this.viewedCount = this.currentViewedCount;
        this.viewedPeriod = this.currentViewedPeriod;
    }

    /**
     * Clears/resets the search form
     */
    @action
    clearSearch() {
        this.currentSmartSearchTerm = '';
        this.currentMatchSynonyms = false;
        this.currentCitedCount = '';
        this.currentViewedCount = '';
        this.currentViewedPeriod = ViewPeriod.PAST_WEEK;
        this.isLimitOpen = false;
        this.currentSearchTerms = cloneDeep(SEARCH_DEFAULT_TERMS);
        this.currentFacets = [];
        taskFor(this.updateRefineMetadata).perform(true, 0);
    }

    /**
     * Adds a new blank search term value field
     * @param {SearchTermValue} newSearchTerm
     */
    @action
    addSearchTerm(newSearchTerm: SearchTermValue) {
        this.currentSearchTerms = this.currentSearchTerms.concat([newSearchTerm]);
    }

    /**
     * Removes a search term value field
     * @param {SearchTermValue} removedSearchTerm
     */
    @action
    removeSearchTerm(removedSearchTerm: SearchTermValue) {
        const searchTerms = this.currentSearchTerms.concat([]);
        searchTerms.removeObject(removedSearchTerm);

        if (searchTerms.length === 0) {
            searchTerms.pushObject({ type: SEARCH_TYPE_EVERYWHERE.id, term: '' });
        }

        this.currentSearchTerms = searchTerms;
        this.onSearchCriteriaChange();
    }

    /**
     * Updates a search term field's value
     * @param {SearchTermValue} oldTerm
     * @param {SearchTermValue} newTerm
     */
    @action
    updateSearchTerm(oldTerm: SearchTermValue, newTerm: SearchTermValue) {
        const searchTerms = this.currentSearchTerms.concat([]);
        //workaround to retain the same term object, instead of splicing in
        //a brand new one like we normally would, so that it doesnt trigger an insert animation
        setProperties(oldTerm, newTerm);
        this.currentSearchTerms = searchTerms;
        this.onSearchCriteriaChange();
    }

    /**
     * Update match synonyms checkbox
     * @param {Boolean} isChecked
     */
    @action
    updateMatchSynonyms(isChecked: boolean) {
        this.currentMatchSynonyms = isChecked;
        this.onSearchCriteriaChange();
    }

    /**
     * Update the search view period
     * @param {ViewPeriod} value
     */
    @action
    updateViewedPeriod(value: ViewPeriod) {
        this.currentViewedPeriod = value;
        this.onSearchCriteriaChange();
    }

    /**
     * Clears the cited/viewed fields when the limit section is collapsed
     * @param {boolean} isOpen
     */
    @action
    toggleLimitFields(isOpen: boolean) {
        this.isLimitOpen = isOpen;
        if (!this.isLimitOpen) {
            this.currentCitedCount = '';
            this.currentViewedCount = '';
            this.currentViewedPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
            this.onSearchCriteriaChange();
        }
    }

    /**
     * Updates the currently selected search facet options
     * and resubmits the search w/the new options after a
     * short delay
     * @param {SearchFacetValue[]} newSelection
     */
    @action
    updateSelectedFacets(newSelection: SearchFacetValue[]) {
        this.currentFacets = newSelection;
        return taskFor(this.resubmitSearchOnFacetsChange).perform();
    }

    /**
     * Updates the Refine facets metadata when any search text input values change
     */
    @action
    onSearchTextChange() {
        return this.onSearchCriteriaChange();
    }

    /**
     * Whenever the main search form criteria changes (smart search, terms, limits, synomyms)
     * Clear any existing Refine facet settings and update the Refine options/counts
     */
    @action
    onSearchCriteriaChange() {
        this.currentFacets = [];
        return taskFor(this.updateRefineMetadata).perform();
    }

    /**
     * Using the current (not submitted) search form values
     * make a metadata query to update the refine options/counts
     * @param {boolean} showLoading
     * @param {number} debounceTimeout
     * @returns {SearchMetadata | null}
     */
    @restartableTask
    *updateRefineMetadata(showLoading: boolean = true, debounceTimeout = 250) {
        try {
            yield timeout(debounceTimeout);

            const searchTerms = this.currentSearchTerms.filter((t: SearchTermValue) => !!t.term);
            const searchParams = buildSearchQueryParams(
                this.currentSmartSearchTerm,
                searchTerms,
                this.currentMatchSynonyms,
                [],
                this.currentCitedCount,
                this.currentViewedCount,
                this.currentViewedPeriod
            );
            if (hasSearchQuery(searchParams)) {
                if (showLoading) {
                    this.loadingBar.show();
                }
                const result = yield this.store.query('document', { ...searchParams, offset: 0, limit: 1 });
                this.resultsMeta = result.meta as SearchMetadata;
            } else {
                //if there is no search fields populated, clear the Refine section
                this.resultsMeta = null;
            }

            return this.resultsMeta;
        } catch (errors) {
            if (!didCancel(errors)) {
                this.resultsMeta = null;
                throw errors;
            }

            return;
        } finally {
            if (showLoading) {
                this.loadingBar.hide();
            }
        }
    }

    /**
     * Opens the selected result in the preview pane
     * @param {Object} result
     * @param {Event} event
     */
    @action
    openResultPreview(result: Document, event: Event) {
        event.preventDefault();
        this.previewedResult = result;
    }

    /**
     * Close the preview pane
     */
    @action
    closeResultPreview() {
        this.previewedResult = null;
        this.previewMode = 'fit';
    }

    /**
     * Set the current preview mode
     * @param {String} mode
     */
    @action
    setPreviewMode(mode: string) {
        this.previewMode = mode;
    }

    /**
     * Show the search form sidebar
     */
    @action
    showSearch() {
        this.sidebar.toggleLeftSidebar(true);
    }

    /**
     * Sets the max height of the search preview pane
     * @param {HTMLElement} element
     */
    @action
    updateContainerMaxHeight(element: HTMLElement) {
        this.containerMaxHeight = element.offsetHeight;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        search: Search;
    }
}
