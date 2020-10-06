import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import Modal from '@gavant/ember-modals/services/modal';

import { SEARCH_DEFAULT_VIEW_PERIOD } from 'pep/constants/search';
import GlossaryTerm from 'pep/pods/glossary-term/model';

interface ModalDialogsGlossaryArgs {
    onClose: () => void;
    options: {
        term: string;
        results: GlossaryTerm[];
    };
}

export default class ModalDialogsGlossary extends Component<ModalDialogsGlossaryArgs> {
    @service router!: RouterService;
    @service modal!: Modal;

    /**
     * Method to search for a specific term using the main search. Navigates the user out of the
     * modal
     *
     * @memberof ModalDialogsGlossary
     */
    @action
    searchForTerm() {
        this.router.transitionTo('search', {
            queryParams: {
                q: '',
                matchSynonyms: false,
                citedCount: '',
                viewedCount: '',
                viewedPeriod: SEARCH_DEFAULT_VIEW_PERIOD,
                searchTerms: null,
                facets: JSON.stringify([{ id: 'glossary_group_terms', value: this.args.options.term }])
            }
        });
        this.args.onClose();
    }

    @action
    viewGlossaryTerm(term: string, results: GlossaryTerm[]) {
        this.args.options = {
            term,
            results
        };
    }
}
