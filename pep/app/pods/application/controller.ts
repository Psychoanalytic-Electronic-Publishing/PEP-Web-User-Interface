import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import LoadingBar from 'pep/services/loading-bar';

export default class Application extends Controller {
    @service loadingBar!: LoadingBar;

    @tracked smartSearchTerm: string = '';
    @tracked searchTerms = [];
    @tracked matchSynonyms: boolean = false;

    @action
    submitSearch() {
        //TODO why is this promise rejecting (shaking submit button) when search includes values?
        return this.transitionToRoute('search', {
            queryParams: {
                smartSearchTerm: this.smartSearchTerm,
                searchTerms: this.searchTerms,
                matchSynonyms: this.matchSynonyms
            }
        });
    }

    @action
    clearSearch() {
        this.smartSearchTerm = '';
        this.searchTerms = [];
        this.matchSynonyms = false;
    }

    @action
    addSearchTerm() {}

    @action
    removeSearchTerm() {}

    @action
    updateMatchSynonyms(isChecked: boolean) {
        this.matchSynonyms = isChecked;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        application: Application;
    }
}
