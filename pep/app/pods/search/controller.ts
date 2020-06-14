import Controller from '@ember/controller';
import { action, setProperties, computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { Promise } from 'rsvp';
import { later } from '@ember/runloop';
import ControllerPagination from '@gavant/ember-pagination/mixins/controller-pagination';
import { SEARCH_TYPE_EVERYWHERE } from 'pep/constants/search';
import { FIXTURE_SEARCH_RESULTS } from 'pep/constants/fixtures';

export default class Search extends ControllerPagination(Controller) {
    queryParams = ['q', { _searchTerms: 'searchTerms' }, 'matchSynonyms'];
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;

    @tracked metadata = {};

    @tracked currentSmartSearchTerm: string = '';
    @tracked currentSearchTerms = [];
    @tracked currentMatchSynonyms: boolean = false;

    @tracked previewedResult = null;
    @tracked previewExpanded = false;

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

    get noResults() {
        return !this.isLoadingPage && (!this.hasSubmittedSearch || !this.model.length);
    }

    //TODO overrides ControllerPagination method, for now
    fetchModels(params) {
        return new Promise((resolve) => {
            later(() => {
                resolve(FIXTURE_SEARCH_RESULTS);
            }, 1500);
        });
    }

    @action
    submitSearch() {
        //update query params
        const searchTerms = this.currentSearchTerms.filter((t) => !!t.term);

        this.q = this.currentSmartSearchTerm;
        this.searchTerms = !isEmpty(searchTerms) ? searchTerms : null;
        this.matchSynonyms = this.currentMatchSynonyms;
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
    }

    @action
    togglePreviewExpanded() {
        this.previewExpanded = !this.previewExpanded;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        search: Search;
    }
}
