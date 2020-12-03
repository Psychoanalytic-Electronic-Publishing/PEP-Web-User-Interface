import Controller from '@ember/controller';
import { action, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import NotificationService from 'ember-cli-notifications/services/notifications';
import { didCancel, timeout } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import IntlService from 'ember-intl/services/intl';

import { SearchMetadata } from 'pep/api';
import { PreferenceKey } from 'pep/constants/preferences';
import { TITLE_REGEX } from 'pep/constants/regex';
import {
    SEARCH_DEFAULT_VIEW_PERIOD, SEARCH_TYPE_ARTICLE, SearchFacetValue, SearchTermValue, SearchViews, SearchViewType,
    ViewPeriod
} from 'pep/constants/search';
import { WIDGET } from 'pep/constants/sidebar';
import { SearchPreviewMode } from 'pep/pods/components/search/preview/component';
import Document from 'pep/pods/document/model';
import AjaxService from 'pep/services/ajax';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import ExportsService, { ExportType } from 'pep/services/exports';
import FastbootMediaService from 'pep/services/fastboot-media';
import LoadingBarService from 'pep/services/loading-bar';
import PrinterService from 'pep/services/printer';
import ScrollableService from 'pep/services/scrollable';
import SearchSelection from 'pep/services/search-selection';
import SidebarService from 'pep/services/sidebar';
import { buildSearchQueryParams, hasSearchQuery } from 'pep/utils/search';
import { SearchSorts, SearchSortType, transformSearchSortsToTable, transformSearchSortToAPI } from 'pep/utils/sort';
import { hash } from 'rsvp';

export default class Search extends Controller {
    @service ajax!: AjaxService;
    @service sidebar!: SidebarService;
    @service loadingBar!: LoadingBarService;
    @service fastboot!: FastbootService;
    @service fastbootMedia!: FastbootMediaService;
    @service scrollable!: ScrollableService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;
    @service exports!: ExportsService;
    @service searchSelection!: SearchSelection;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service printer!: PrinterService;

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
        { _facets: 'facets' },
        'preview'
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

    @tracked previewedResult?: Document | null = null;
    @tracked preview?: string | null = null;
    @tracked previewMode: SearchPreviewMode = 'fit';
    @tracked containerMaxHeight = 0;

    @tracked selectedView = this.currentUser.preferences?.searchViewType ?? SearchViews[0];
    @tracked selectedSort = this.currentUser.preferences?.searchSortType ?? SearchSorts[0];

    readLaterKey = PreferenceKey.READ_LATER;
    favoritesKey = PreferenceKey.FAVORITES;
    tableView = SearchViewType.TABLE;
    searchViews = SearchViews;
    sorts = SearchSorts;

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
    get readQueryParams() {
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
     * If items are selected, use that for the export/print data. Otherwise use the paginator
     *
     * @readonly
     * @memberof Search
     */
    get exportedData() {
        return this.searchSelection.includedRecords.length
            ? this.searchSelection.includedRecords
            : this.paginator.models;
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

    get tableSorts() {
        return transformSearchSortsToTable(this.paginator.sorts);
    }

    /**
     * Submits the search/nav template's search form
     * @returns Document[]
     */
    @action
    async submitSearch() {
        try {
            this.searchSelection.clear();
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

        this.q = '';
        this.currentSmartSearchTerm = '';
        this.currentMatchSynonyms = false;
        this.currentCitedCount = '';
        this.currentViewedCount = '';
        this.currentViewedPeriod = ViewPeriod.PAST_WEEK;
        this.isLimitOpen = isLimitOpen;
        this.currentSearchTerms = terms.map((f) => ({ type: f, term: '' }));
        this.currentFacets = [];
        taskFor(this.updateRefineMetadata).perform(true, 0);
        this.paginator.clearModels();
        this.searchSelection.clear();
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
            searchTerms.pushObject({ type: SEARCH_TYPE_ARTICLE.id, term: '' });
        }

        this.currentSearchTerms = searchTerms;
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
        taskFor(this.updateSearchFormPrefs).perform();
    }

    /**
     * Update match synonyms checkbox
     * @param {Boolean} isChecked
     */
    @action
    updateMatchSynonyms(isChecked: boolean) {
        this.currentMatchSynonyms = isChecked;
    }

    /**
     * Update the search view period
     * @param {ViewPeriod} value
     */
    @action
    updateViewedPeriod(value: ViewPeriod) {
        this.currentViewedPeriod = value;
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
    }

    /**
     * Updates the smart search text
     * Updates the Refine facets metadata when any search text input values change
     */
    @action
    updateSmartSearchText(newText: string) {
        this.currentSmartSearchTerm = newText;
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
            const searchParams = buildSearchQueryParams({
                smartSearchTerm: this.currentSmartSearchTerm,
                searchTerms,
                synonyms: this.currentMatchSynonyms,
                citedCount: this.currentCitedCount,
                viewedCount: this.currentViewedCount,
                viewedPeriod: this.currentViewedPeriod,
                facetFields: cfg.facets.defaultFields,
                joinOp: 'AND',
                facetLimit: cfg.facets.valueLimit,
                facetMinCount: cfg.facets.valueMinCount,
                highlightlimit: this.currentUser.preferences?.searchHICLimit ?? cfg.hitsInContext.limit
            });

            if (hasSearchQuery(searchParams)) {
                if (showLoading) {
                    this.loadingBar.show();
                }
                const result = yield this.store.query('search-document', { ...searchParams, offset: 0, limit: 1 });
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
    openResult(result: Document, event?: Event) {
        event?.preventDefault();
        if (this.currentUser.preferences?.searchPreviewEnabled) {
            this.previewedResult = result;
            this.preview = result.id;
            this.sidebar.update({
                [WIDGET.MORE_LIKE_THESE]: result,
                [WIDGET.RELATED_DOCUMENTS]: result
            });
        } else {
            this.transitionToRoute('read.document', result.id, {
                queryParams: this.readQueryParams
            });
        }
    }

    /**
     * Close the preview pane
     */
    @action
    closeResultPreview() {
        this.preview = null;
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
        this.currentUser.updatePrefs({
            [PreferenceKey.SEARCH_VIEW_TYPE]: selectedView
        });
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
        const id = event.target.value as SearchSortType;
        const selectedSort = SearchSorts.find((item) => item.id === id);
        this.selectedSort = selectedSort!;
        this.paginator.changeSorting([
            {
                valuePath: id,
                isAscending: true
            }
        ]);
        this.currentUser.updatePrefs({ [PreferenceKey.SEARCH_SORT_TYPE]: selectedSort });
    }

    /**
     * Export a CSV
     *
     * @memberof Search
     */
    @action
    exportCSV() {
        const data = this.exportedData;
        const formattedData = data.map((item) => [
            item.authorMast,
            item.year,
            item.title.replace(TITLE_REGEX, '$1'),
            item.documentRef
        ]);
        this.exports.export(ExportType.CSV, 'data.csv', {
            fields: ['Author', 'Year', 'Title', 'Source'],
            data: [...formattedData]
        });
    }

    /**
     * Get the correctly formatted data for the clipboard and return it
     *
     * @returns
     * @memberof Search
     */
    @action
    exportClipboard() {
        const data = this.exportedData;
        const formattedData = data.map(
            (item) => `${item.authorMast}, ${item.year}, ${item.title.replace(TITLE_REGEX, '$1')}, ${item.documentRef}`
        );
        return formattedData.join('\r\n');
    }

    /**
     * Show success message for clipboard
     *
     * @memberof Search
     */
    @action
    clipboardSuccess() {
        const translation = this.intl.t('exports.clipboard.success');

        this.notifications.success(translation);
    }

    /**
     * Show failure message for clipboard
     *
     * @memberof Search
     */
    @action
    clipboardFailure() {
        this.notifications.success(this.intl.t('exports.clipboard.failure'));
    }

    /**
     * Print the current selected items or whats loaded into the paginator
     *
     * @memberof Search
     */
    @action
    print() {
        const data = this.exportedData;
        if (this.selectedView.id === SearchViewType.BIBLIOGRAPHIC) {
            const html = this.printer.dataToBibliographicHTML(data);
            this.printer.printHTML(html);
        } else {
            this.printer.printJSON<Document>(data, [
                {
                    field: 'authorMast',
                    displayName: this.intl.t('print.author')
                },
                {
                    field: 'year',
                    displayName: this.intl.t('print.year')
                },
                {
                    field: 'title',
                    displayName: this.intl.t('print.title')
                },
                {
                    field: 'documentRef',
                    displayName: this.intl.t('print.source')
                }
            ]);
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        search: Search;
    }
}
