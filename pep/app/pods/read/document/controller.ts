import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import ModalService from '@gavant/ember-modals/services/modal';
import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import { PreferenceKey } from 'pep/constants/preferences';
import { TITLE_REGEX } from 'pep/constants/regex';
import { SEARCH_DEFAULT_VIEW_PERIOD, SearchViews, SearchViewType, ViewPeriod } from 'pep/constants/search';
import Document from 'pep/pods/document/model';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import ExportsService, { ExportType } from 'pep/services/exports';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import PrinterService from 'pep/services/printer';
import SearchSelection from 'pep/services/search-selection';
import { buildSearchQueryParams, clearSearch } from 'pep/utils/search';
import { SearchSorts, SearchSortType, transformSearchSortsToTable, transformSearchSortToAPI } from 'pep/utils/sort';
import { reject } from 'rsvp';

export default class ReadDocument extends Controller {
    @service('pep-session') session!: PepSessionService;
    @service auth!: AuthService;
    @service fastboot!: FastbootService;
    @service loadingBar!: LoadingBarService;
    @service router!: RouterService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;
    @service modal!: ModalService;
    @service exports!: ExportsService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service printer!: PrinterService;
    @service searchSelection!: SearchSelection;

    @tracked selectedView = SearchViews[0];
    @tracked selectedSort = SearchSorts[0];
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked citedCount: string = '';
    @tracked viewedCount: string = '';
    @tracked viewedPeriod: ViewPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
    @tracked _searchTerms: string | null = null;
    @tracked paginator!: Pagination<Document>;
    @tracked showHitsInContext = false;
    @tracked page = null;

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
        { _facets: 'facets' }
    ];

    readLaterKey = PreferenceKey.READ_LATER;
    favoritesKey = PreferenceKey.FAVORITES;
    tableView = SearchViewType.TABLE;
    searchViews = SearchViews;
    sorts = SearchSorts;

    get readQueryParams() {
        return {
            q: this.q,
            searchTerms: this._searchTerms,
            facets: this._facets,
            matchSynonyms: this.matchSynonyms
        };
    }

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
     * Transform the sorting to a format the API can handle
     *
     * @param {string[]} sorts
     * @returns
     * @memberof Search
     */
    @action
    onChangeSorting(sorts: string[]) {
        return transformSearchSortToAPI(sorts);
    }

    get tableSorts() {
        return transformSearchSortsToTable(this.paginator.sorts);
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
        this.showHitsInContext = value;
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
        if (selectedSort) {
            this.selectedSort = selectedSort;
            this.paginator.changeSorting([
                {
                    valuePath: id,
                    isAscending: true
                }
            ]);
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
        this.transitionToRoute('read.document', document.id, {
            queryParams: {
                q: this.q,
                matchSynonyms: this.matchSynonyms,
                searchTerms: this._searchTerms
            }
        });
    }

    /**
     * Open the glossary modal to view the term
     *
     * @param {string} term
     * @param {GlossaryTerm} results
     * @memberof ReadDocument
     */
    @action
    viewGlossaryTerm(term: string, results: GlossaryTerm) {
        this.modal.open('glossary', {
            results,
            term
        });
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

    /**
     * Clear the old search and then go to the search page using the new search terms
     *
     * @param {string} searchTerms
     * @memberof ReadDocument
     */
    @action
    viewSearch(searchTerms: string) {
        // TODO improve this typing
        clearSearch(this as any, this.configuration, this.currentUser);
        this.router.transitionTo('search', {
            queryParams: {
                ...this.configuration.defaultSearchParams,
                searchTerms
            }
        });
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        readDocument: ReadDocument;
    }
}
