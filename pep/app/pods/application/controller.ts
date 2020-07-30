import Controller from '@ember/controller';
import { action, setProperties } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import SessionService from 'ember-simple-auth/services/session';
import ModalService from '@gavant/ember-modals/services/modal';
import LoadingBar from 'pep/services/loading-bar';
import AuthService from 'pep/services/auth';
import {
    SEARCH_TYPE_EVERYWHERE,
    SEARCH_DEFAULT_TERMS,
    SEARCH_DEFAULT_FACETS,
    SearchTermValue
} from 'pep/constants/search';

export default class Application extends Controller {
    @service loadingBar!: LoadingBar;
    @service modal!: ModalService;
    @service session!: SessionService;
    @service auth!: AuthService;

    //json stringify is workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    defaultSearchTerms = JSON.stringify(SEARCH_DEFAULT_TERMS);
    defaultSearchFacets = JSON.stringify(SEARCH_DEFAULT_FACETS);

    @tracked smartSearchTerm: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked searchTerms: SearchTermValue[] = [
        { type: 'everywhere', term: '' },
        { type: 'title', term: '' },
        { type: 'author', term: '' }
    ];

    /**
     * Submits the application/nav sidebar's search form and transitions the
     * user to the search results page to fetch and display the results
     */
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

    /**
     * Clears/resets the application/nav sidebar's search form
     */
    @action
    clearSearch() {
        this.smartSearchTerm = '';
        this.matchSynonyms = false;
        this.searchTerms = [{ type: 'everywhere', term: '' }];
    }

    /**
     * Adds a new blank search term value field
     * @param {SearchTermValue} newSearchTerm
     */
    @action
    addSearchTerm(newSearchTerm: SearchTermValue) {
        this.searchTerms = this.searchTerms.concat([newSearchTerm]);
    }

    /**
     * Removes a search term value field
     * @param {SearchTermValue} removedSearchTerm
     */
    @action
    removeSearchTerm(removedSearchTerm: SearchTermValue) {
        const searchTerms = this.searchTerms.concat([]);
        searchTerms.removeObject(removedSearchTerm);

        if (searchTerms.length === 0) {
            searchTerms.pushObject({ type: SEARCH_TYPE_EVERYWHERE.id, term: '' });
        }

        this.searchTerms = searchTerms;
    }

    /**
     * Updates a search term field's value
     * @param {SearchTermValue} oldTerm
     * @param {SearchTermValue} newTerm
     */
    @action
    updateSearchTerm(oldTerm: SearchTermValue, newTerm: SearchTermValue) {
        const searchTerms = this.searchTerms.concat([]);
        //workaround to retain the same term object, instead of splicing in
        //a brand new one like we normally would, so that it doesnt trigger an insert animation
        setProperties(oldTerm, newTerm);
        this.searchTerms = searchTerms;
    }

    /**
     * Update match synonyms checkbox
     * @param {Boolean} isChecked
     */
    @action
    updateMatchSynonyms(isChecked: boolean) {
        this.matchSynonyms = isChecked;
    }

    /**
     * Opens the user preferences modal dialog
     */
    @action
    openPreferencesModal() {
        this.modal.open('user/preferences', {});
    }

    /**
     * Opens the login modal dialog
     */
    @action
    openLoginModal() {
        return this.auth.openLoginModal(true);
    }

    /**
     * Logs the user out
     */
    @action
    logout() {
        return this.session.invalidate();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        application: Application;
    }
}
