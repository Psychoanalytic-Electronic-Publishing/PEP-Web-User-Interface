import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';

import GlossaryTerm from 'pep/pods/glossary-term/adapter';
import { SEARCH_DEFAULT_VIEW_PERIOD } from 'pep/constants/search';

interface ModalDialogsGlossaryArgs {
    onClose: () => void;
    options: {
        term: string;
        results: GlossaryTerm[];
    };
}

export default class ModalDialogsGlossary extends Component<ModalDialogsGlossaryArgs> {
    @service router!: RouterService;

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
}
