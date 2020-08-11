import Controller from '@ember/controller';
import { action, setProperties } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { later } from '@ember/runloop';
import { tracked } from '@glimmer/tracking';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';
import { SEARCH_TYPE_EVERYWHERE, SearchTermValue, SearchFacetValue } from 'pep/constants/search';
import SidebarService from 'pep/services/sidebar';
import LoadingBarService from 'pep/services/loading-bar';
import FastbootMediaService from 'pep/services/fastboot-media';
import Document from 'pep/pods/document/model';
import ScrollableService from 'pep/services/scrollable';
import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { buildSearchQueryParams } from 'pep/utils/search';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';
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
    queryParams = ['q', { _searchTerms: 'searchTerms' }, 'matchSynonyms', { _facets: 'facets' }];
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked paginator!: Pagination<Document>;

    @tracked currentSmartSearchTerm: string = '';
    @tracked currentSearchTerms: SearchTermValue[] = [];
    @tracked currentMatchSynonyms: boolean = false;
    @tracked currentFacets: SearchFacetValue[] = [];

    @tracked previewedResult: Document | null = null;
    @tracked previewMode = 'fit';

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    @tracked _searchTerms: string | null = JSON.stringify([
        { type: 'everywhere', term: '' },
        { type: 'title', term: '' },
        { type: 'author', term: '' }
    ]);
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
        return !this.paginator.isLoadingModels && (!this.hasSubmittedSearch || !this.model.length);
    }

    get hasRefineChanges() {
        return JSON.stringify(this.currentFacets) !== JSON.stringify(this.facets);
    }

    @action
    processQueryParams(params: QueryParamsObj) {
        const searchParams = buildSearchQueryParams(this.q, this.searchTerms, this.matchSynonyms, this.facets);
        return { ...params, ...searchParams };
    }

    /**
     * Loads the next page of results
     */
    @action
    loadNextPage() {
        if (!this.paginator.isLoadingModels && this.paginator.hasMore) {
            return this.paginator.loadMoreModels();
        }
        return undefined;
    }

    /**
     * Submits the search/nav template's search form
     */
    @action
    async submitSearch() {
        try {
            //update query params
            const searchTerms = this.currentSearchTerms.filter((t: SearchTermValue) => !!t.term);

            this.q = this.currentSmartSearchTerm;
            this.searchTerms = !isEmpty(searchTerms) ? searchTerms : null;
            this.matchSynonyms = this.currentMatchSynonyms;

            //clear any open document preview
            this.closeResultPreview();

            //close overlay sidebar on submit in mobile/tablet
            if (this.fastbootMedia.isSmallDevice) {
                this.sidebar.toggleLeftSidebar();
            }

            //perform search
            this.loadingBar.show();
            this.scrollable.scrollToTop('search-results');
            const results = await this.paginator.filterModels();
            this.loadingBar.hide();
            this.scrollable.recalculate('sidebar-left');
            return results;
        } catch (err) {
            this.loadingBar.hide();
            throw err;
        }
    }

    /**
     * Resubmits the search form with the currently selected facet values
     */
    @action
    async resubmitSearchWithFacets() {
        try {
            this.facets = this.currentFacets;
            this.closeResultPreview();

            //close overlay sidebar on submit in mobile/tablet
            if (this.fastbootMedia.isSmallDevice) {
                this.sidebar.toggleLeftSidebar();
            }

            this.loadingBar.show();
            const results = await this.paginator.filterModels();
            this.loadingBar.hide();
            return results;
        } catch (err) {
            this.loadingBar.hide();
            throw err;
        }
    }

    /**
     * Clears/resets the search form
     */
    @action
    clearSearch() {
        this.currentSmartSearchTerm = '';
        this.currentMatchSynonyms = false;
        this.currentSearchTerms = [{ type: 'everywhere', term: '' }];
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
     * Updates the currently selected search facet options
     * @param {SearchFacetValue[]} newSelection
     */
    @action
    updateSelectedFacets(newSelection: SearchFacetValue[]) {
        this.currentFacets = newSelection;
    }

    /**
     * Opens the selected result in the preview pane
     * @param {Object} result
     * @param {Event} event
     */
    @action
    openResultPreview(result: Document, event: Event) {
        event.preventDefault();
        //TODO get rid of the need for this delay, by just recalcing the fit height whenever the result changes
        if (this.previewedResult) {
            //set the new result in the next runloop, so its "fit" height is recalculated
            this.previewedResult = null;
            later(this, () => (this.previewedResult = result), 20);
        } else {
            this.previewedResult = result;
        }
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
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        search: Search;
    }
}
