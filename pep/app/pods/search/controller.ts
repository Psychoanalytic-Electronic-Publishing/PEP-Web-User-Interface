import Controller from '@ember/controller';
import { action, setProperties, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import ControllerPagination from '@gavant/ember-pagination/mixins/controller-pagination';
import AjaxService from 'pep/services/ajax';
import { SEARCH_TYPE_EVERYWHERE } from 'pep/constants/search';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';
import { FIXTURE_SEARCH_RESULTS } from 'pep/constants/fixtures';
import { buildSearchQueryParams } from 'pep/utils/search';
import Sidebar from 'pep/services/sidebar';

export default class Search extends ControllerPagination(Controller) {
    @service ajax!: AjaxService;
    @service sidebar!: Sidebar;
    @service media;

    queryParams = ['q', { _searchTerms: 'searchTerms' }, 'matchSynonyms'];
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;

    @tracked currentSmartSearchTerm: string = '';
    @tracked currentSearchTerms = [];
    @tracked currentMatchSynonyms: boolean = false;

    @tracked previewedResult = null;
    @tracked previewIsExpanded = false;

    //pagination config
    pagingRootKey = null;
    filterRootKey = null;

    //TODO will be removed once proper pagination is hooked up
    @tracked metadata = {};

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    @tracked _searchTerms = JSON.stringify([
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

    @computed('q,searchTerms.@each.term')
    get hasSubmittedSearch() {
        return this.q || this.searchTerms.filter((t) => !!t.term).length > 0;
    }

    @computed('isLoadingPage,hasSubmittedSearch,model.length')
    get noResults() {
        return !this.isLoadingPage && (!this.hasSubmittedSearch || !this.model.length);
    }

    //TODO TBD - overrides ControllerPagination, will not be needed once api is integrated w/ember-data
    async fetchModels(params) {
        const searchQueryParams = buildSearchQueryParams(this.q, this.searchTerms, this.matchSynonyms);
        const queryParams = { ...params, ...searchQueryParams };
        const queryStr = serializeQueryParams(queryParams);
        const result = await this.ajax.request(`Database/Search?${queryStr}`);
        //TODO add matches dummy data for demo purposes
        const matches = FIXTURE_SEARCH_RESULTS[0].matches;
        const results = result.documentList.responseSet.map((r) => ({ ...r, matches }));
        return {
            toArray: () => results,
            data: results,
            meta: result.documentList.responseInfo
        };
    }

    @action
    loadNextPage() {
        if (!this.isLoadingPage && this.hasMore) {
            return this.loadMoreModels();
        }
    }

    @action
    submitSearch() {
        //update query params
        const searchTerms = this.currentSearchTerms.filter((t) => !!t.term);

        this.q = this.currentSmartSearchTerm;
        this.searchTerms = !isEmpty(searchTerms) ? searchTerms : null;
        this.matchSynonyms = this.currentMatchSynonyms;

        if (this.media.isMobile) {
            this.sidebar.toggleLeftSidebar();
        }

        //perform search
        return this.filter();
    }

    @action
    clearSearch() {
        this.currentSmartSearchTerm = '';
        this.currentMatchSynonyms = false;
        this.currentSearchTerms = [{ type: 'everywhere', term: '' }];
    }

    @action
    addSearchTerm(newSearchTerm) {
        this.currentSearchTerms = this.currentSearchTerms.concat([newSearchTerm]);
    }

    @action
    removeSearchTerm(removedSearchTerm) {
        const searchTerms = this.currentSearchTerms.concat([]);
        searchTerms.removeObject(removedSearchTerm);

        if (searchTerms.length === 0) {
            searchTerms.pushObject({ type: SEARCH_TYPE_EVERYWHERE.id, term: '' });
        }

        this.currentSearchTerms = searchTerms;
    }

    @action
    updateSearchTerm(oldTerm, newTerm) {
        const searchTerms = this.currentSearchTerms.concat([]);
        //workaround to retain the same term object, instead of splicing in
        //a brand new one like we normally would, so that it doesnt trigger an insert animation
        setProperties(oldTerm, newTerm);
        this.currentSearchTerms = searchTerms;
    }

    @action
    updateMatchSynonyms(isChecked: boolean) {
        this.currentMatchSynonyms = isChecked;
    }

    @action
    openResultPreview(result, event) {
        event.preventDefault();
        this.previewedResult = result;
    }

    @action
    closeResultPreview() {
        this.previewedResult = null;
        this.previewIsExpanded = false;
    }

    @action
    togglePreviewExpanded() {
        this.previewIsExpanded = !this.previewIsExpanded;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        search: Search;
    }
}
