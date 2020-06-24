import Controller from '@ember/controller';
import { action, setProperties } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import SessionService from 'ember-simple-auth/services/session';
import ModalService from '@gavant/ember-modals/services/modal';
import LoadingBar from 'pep/services/loading-bar';
import AuthService from 'pep/services/auth';
import { SEARCH_TYPE_EVERYWHERE, SEARCH_DEFAULT_TERMS, SEARCH_DEFAULT_FACETS } from 'pep/constants/search';

export default class Application extends Controller {
    @service loadingBar!: LoadingBar;
    @service modal!: ModalService;
    @service session!: SessionService;
    @service auth!: AuthService;

    defaultSearchTerms = JSON.stringify(SEARCH_DEFAULT_TERMS);
    defaultSearchFacets = JSON.stringify(SEARCH_DEFAULT_FACETS);

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

    @action
    openPreferencesModal() {
        this.modal.open('user/preferences', {});
    }

    @action
    openLoginModal() {
        return this.auth.openLoginModal(true);
    }

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
