import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import DS from 'ember-data';

import ModalService from '@gavant/ember-modals/services/modal';

import Document from 'pep/pods/document/model';
import GlossaryTerm from 'pep/pods/glossary-term/model';
import { SearchQueryParams } from 'pep/pods/search/index/route';
import { SearchReadParams } from 'pep/pods/search/read/route';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import { clearSearch } from 'pep/utils/search';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface DocumentReadArgs {
    model: Document;
    page: number;
    searchQueryParams?: SearchReadParams;
    searchHitNumber?: number;
    onAuthenticated: () => void;
    documentRendered?: () => void;
}

export default class DocumentRead extends Component<BaseGlimmerSignature<DocumentReadArgs>> {
    @service modal!: ModalService;
    @service router!: RouterService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;
    @service auth!: AuthService;
    @service loadingBar!: LoadingBarService;
    @service store!: DS.Store;
    @service('pep-session') session!: PepSessionService;

    /**
     * Opens the login modal dialog
     * @param {Event} event
     */
    @action
    login(event: Event) {
        event.preventDefault();
        return this.auth.openLoginModal(true);
    }

    /**
     * Clear the old search and then go to the search page using the new search terms
     *
     * @param {string} searchTerms
     * @memberof ReadDocument
     */
    @action
    viewSearch(search: SearchQueryParams) {
        clearSearch(this);
        this.router.transitionTo('search', {
            queryParams: {
                ...this.configuration.defaultSearchParams,
                ...search
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

    @action
    documentRendered() {
        this.args.documentRendered?.();
    }
}
