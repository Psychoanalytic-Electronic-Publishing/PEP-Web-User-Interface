import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { Promise } from 'rsvp';
import { later } from '@ember/runloop';
import ControllerPagination from '@gavant/ember-pagination/mixins/controller-pagination';

export default class Search extends ControllerPagination(Controller) {
    queryParams = ['q', 'searchTerms', 'matchSynonyms'];
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked searchTerms = ''; //@TODO need to fix bug w/array QPs
    @tracked metadata = {};

    @tracked currentSmartSearchTerm: string = '';
    @tracked currentSearchTerms = [];
    @tracked currentMatchSynonyms: boolean = false;

    //workaround for https://github.com/emberjs/ember.js/issues/18981
    // get convertedSearchTerms() {
    //     if (Array.isArray(array) && array.length > 0) {
    //         this._projects = JSON.stringify(array).slice(1, -1);
    //     } else {
    //         this._projects = '';
    //     }
    // }

    get hasSubmittedSearch() {
        return this.q || this.searchTerms.length > 0;
    }

    get noResults() {
        return !this.isLoadingPage && (!this.hasSubmittedSearch || !this.model.length);
    }

    //TODO overrides ControllerPagination method, for now
    fetchModels(params) {
        return new Promise((resolve) => {
            later(() => {
                const models = [
                    {
                        id: 3,
                        title: 'This is a test result'
                    },
                    {
                        id: 4,
                        title: 'This is another test result'
                    },
                    {
                        id: 5,
                        title: 'This is a third test result'
                    }
                ];
                resolve(models);
            }, 1500);
        });
    }

    @action
    submitSearch() {
        //update query params
        this.q = this.currentSmartSearchTerm;
        this.searchTerms = this.currentSearchTerms;
        this.matchSynonyms = this.currentMatchSynonyms;
        //perform search
        return this.filter();
    }

    @action
    clearSearch() {
        this.currentSmartSearchTerm = '';
        this.currentSearchTerms = [];
        this.currentMatchSynonyms = false;
    }

    @action
    addSearchTerm() {}

    @action
    removeSearchTerm() {}

    @action
    updateMatchSynonyms(isChecked: boolean) {
        this.currentMatchSynonyms = isChecked;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        search: Search;
    }
}
