import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class Search extends Controller {
    queryParams = ['smartSearchTerm', 'searchTerms', 'matchSynonyms'];
    @tracked smartSearchTerm: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked searchTerms = [];

    @tracked currentSmartSearchTerm: string = '';
    @tracked currentSearchTerms = [];
    @tracked currentMatchSynonyms: boolean = false;

    @action
    submitSearch() {
        return this.transitionToRoute('search', {
            queryParams: {
                smartSearchTerm: this.currentSmartSearchTerm,
                searchTerms: this.currentSearchTerms,
                matchSynonyms: this.currentMatchSynonyms
            }
        });
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
