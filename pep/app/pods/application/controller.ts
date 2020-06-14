import Controller from '@ember/controller';
import { action, setProperties } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import LoadingBar from 'pep/services/loading-bar';
import { SEARCH_TYPE_EVERYWHERE } from 'pep/constants/search';

export default class Application extends Controller {
    @service loadingBar!: LoadingBar;

    @tracked smartSearchTerm: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked searchTerms = [
        { type: 'everywhere', term: '' },
        { type: 'title', term: '' },
        { type: 'author', term: '' }
    ];

    @action
    submitSearch() {
        const searchTerms = this.searchTerms.filter((t) => !!t.term);

        const queryParams = {
            q: this.smartSearchTerm,
            matchSynonyms: this.matchSynonyms,
            //json stringify is workaround for bug w/array-based query param values
            //@see https://github.com/emberjs/ember.js/issues/18981
            searchTerms: !isEmpty(searchTerms) ? JSON.stringify(searchTerms) : null
        };

        return this.transitionToRoute('search', { queryParams });
    }

    @action
    clearSearch() {
        this.smartSearchTerm = '';
        this.matchSynonyms = false;
        this.searchTerms = [{ type: 'everywhere', term: '' }];
    }

    @action
    addSearchTerm(newSearchTerm) {
        this.searchTerms = this.searchTerms.concat([newSearchTerm]);
    }

    @action
    removeSearchTerm(removedSearchTerm) {
        const searchTerms = this.searchTerms.concat([]);
        searchTerms.removeObject(removedSearchTerm);

        if (searchTerms.length === 0) {
            searchTerms.pushObject({ type: SEARCH_TYPE_EVERYWHERE.id, term: '' });
        }

        this.searchTerms = searchTerms;
    }

    @action
    updateSearchTerm(oldTerm, newTerm) {
        const searchTerms = this.searchTerms.concat([]);
        //workaround to retain the same term object, instead of splicing in
        //a brand new one like we normally would, so that it doesnt trigger an insert animation
        setProperties(oldTerm, newTerm);
        this.searchTerms = searchTerms;
    }

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
