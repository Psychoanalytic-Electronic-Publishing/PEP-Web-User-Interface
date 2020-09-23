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

import Document from 'pep/pods/document/model';
import AjaxService from 'pep/services/ajax';
import {
    SEARCH_TYPE_EVERYWHERE,
    SearchTermValue,
    SearchFacetValue,
    ViewPeriod,
    SEARCH_DEFAULT_VIEW_PERIOD
} from 'pep/constants/search';
import { PreferenceKey } from 'pep/constants/preferences';
import SidebarService from 'pep/services/sidebar';
import LoadingBarService from 'pep/services/loading-bar';
import FastbootMediaService from 'pep/services/fastboot-media';
import ScrollableService from 'pep/services/scrollable';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import { buildSearchQueryParams, hasSearchQuery } from 'pep/utils/search';
import { SearchMetadata } from 'pep/api';
import { WIDGET } from 'pep/constants/sidebar';
import { SearchPreviewMode } from 'pep/pods/components/search/preview/component';

export default class Search extends Controller {
    @service ajax!: AjaxService;
    @service sidebar!: SidebarService;
    @service loadingBar!: LoadingBarService;
    @service fastboot!: FastbootService;
    @service fastbootMedia!: FastbootMediaService;
    @service scrollable!: ScrollableService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;

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
    @tracked previewMode: SearchPreviewMode = 'minimized';
    @tracked containerMaxHeight = 0;

    readLaterKey = PreferenceKey.READ_LATER;
    favoritesKey = PreferenceKey.FAVORITES;

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    @tracked _searchTerms: string | null = null;
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

    /**
     * The query params object to pass to <LinkTo>'s and route transitions
     * when opening the Read page for a document
     * @readonly
     */
    get readQueryParms() {
        return {
            q: this.q,
            searchTerms: this._searchTerms,
            facets: this._facets,
            matchSynonyms: this.matchSynonyms
        };
    }

    get hasSubmittedSearch() {
        return !!(
            this.q ||
            this.citedCount ||
            this.viewedCount ||
            this.searchTerms.filter((t: SearchTermValue) => !!t.term).length > 0
        );
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
        const cfg = this.configuration.base.search;
        const searchParams = buildSearchQueryParams(
            this.q,
            this.searchTerms,
            this.matchSynonyms,
            this.facets,
            this.citedCount,
            this.viewedCount,
            this.viewedPeriod,
            cfg.facets.defaultFields,
            'AND',
            cfg.facets.valueLimit,
            cfg.facets.valueMinCount
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
                documents: this.paginator.filterModels(true),
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
            this.scrollable.scrollToTop('search-results');
            const results = await hash({
                documents: this.paginator.filterModels(true),
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
        this.facets = this.currentFacets;
    }

    /**
     * Clears/resets the search form
     */
    @action
    clearSearch() {
        const cfg = this.configuration.base.search;
        const prefs = this.currentUser.preferences;
        const terms = prefs?.searchTermFields ?? cfg.terms.defaultFields;
        const isLimitOpen = prefs?.searchLimitIsShown ?? cfg.limitFields.isShown;

        this.currentSmartSearchTerm = '';
        this.currentMatchSynonyms = false;
        this.currentCitedCount = '';
        this.currentViewedCount = '';
        this.currentViewedPeriod = ViewPeriod.PAST_WEEK;
        this.isLimitOpen = isLimitOpen;
        this.currentSearchTerms = terms.map((f) => ({ type: f, term: '' }));
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
        taskFor(this.updateSearchFormPrefs).perform();
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
        taskFor(this.updateSearchFormPrefs).perform();
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
        taskFor(this.updateSearchFormPrefs).perform();
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

        taskFor(this.updateSearchFormPrefs).perform();
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
     * Updates the smart search text
     * Updates the Refine facets metadata when any search text input values change
     */
    @action
    updateSmartSearchText(newText: string) {
        this.currentSmartSearchTerm = newText;
        this.onSearchCriteriaChange();
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

            const cfg = this.configuration.base.search;
            const searchTerms = this.currentSearchTerms.filter((t: SearchTermValue) => !!t.term);
            const searchParams = buildSearchQueryParams(
                this.currentSmartSearchTerm,
                searchTerms,
                this.currentMatchSynonyms,
                [],
                this.currentCitedCount,
                this.currentViewedCount,
                this.currentViewedPeriod,
                cfg.facets.defaultFields,
                'AND',
                cfg.facets.valueLimit,
                cfg.facets.valueMinCount
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

            this.sidebar.update({
                [WIDGET.GLOSSARY_TERMS]: this.resultsMeta?.facetCounts.facet_fields.glossary_group_terms,
                [WIDGET.RELATED_DOCUMENTS]: undefined,
                [WIDGET.MORE_LIKE_THESE]: undefined
            });

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
     * Updates the user's search form preferences after a short delay
     */
    @restartableTask
    *updateSearchFormPrefs() {
        yield timeout(500);
        yield this.currentUser.updatePrefs({
            [PreferenceKey.SEARCH_LIMIT_IS_SHOWN]: this.isLimitOpen,
            [PreferenceKey.SEARCH_TERM_FIELDS]: this.currentSearchTerms.map((t) => t.type)
        });
    }

    /**
     * Opens the selected result in the preview pane or the full read page,
     * depending on the user's preferences
     * @param {Object} result
     * @param {Event} event
     */
    @action
    openResult(result: Document, event: Event) {
        event.preventDefault();
        if (this.currentUser.preferences?.searchPreviewEnabled) {
            this.previewedResult = result;
            this.sidebar.update({
                [WIDGET.MORE_LIKE_THESE]: result,
                [WIDGET.RELATED_DOCUMENTS]: result
            });
        } else {
            this.transitionToRoute('read.document', result.id, {
                queryParams: this.readQueryParms
            });
        }
    }

    /**
     * Close the preview pane
     */
    @action
    closeResultPreview() {
        this.previewedResult = null;
        this.sidebar.update({
            [WIDGET.MORE_LIKE_THESE]: undefined,
            [WIDGET.RELATED_DOCUMENTS]: undefined
        });
    }

    /**
     * Set the current preview mode
     * @param {String} mode
     */
    @action
    setPreviewMode(mode: SearchPreviewMode) {
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
