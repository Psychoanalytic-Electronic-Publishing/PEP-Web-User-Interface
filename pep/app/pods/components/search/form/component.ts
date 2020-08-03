import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import {
    SEARCH_TYPES,
    SEARCH_TYPE_EVERYWHERE,
    SEARCH_RESULTS_WARNING_COUNT,
    SearchTermValue
} from 'pep/constants/search';

interface SearchFormArgs {
    resultsCount?: number;
    smartSearchTerm?: string;
    searchTerms?: SearchTermValue[];
    addSearchTerm: (term: SearchTermValue) => void;
    updateSearchTerm: (oldTerm: SearchTermValue, newTerm: SearchTermValue) => void;
}

export default class SearchForm extends Component<SearchFormArgs> {
    searchTypes = SEARCH_TYPES;

    @computed('args.{smartSearchTerm,searchTerms.@each.term}')
    get hasEnteredSearch() {
        return (
            this.args.smartSearchTerm ||
            (Array.isArray(this.args.searchTerms) && this.args.searchTerms.filter((t) => !!t.term).length > 0)
        );
    }

    get hasTooManyResults() {
        return this.args.resultsCount && this.args.resultsCount > SEARCH_RESULTS_WARNING_COUNT;
    }

    /**
     * Add a new search term field
     */
    @action
    addSearchTerm() {
        this.args.addSearchTerm({
            type: SEARCH_TYPE_EVERYWHERE.id,
            term: ''
        });
    }

    /**
     * Update a search term value
     * @param {SearchTermValue} oldTerm
     * @param {HTMLElementEvent<HTMLSelectElement>} event
     */
    @action
    updateTermType(oldTerm: SearchTermValue, event: HTMLElementEvent<HTMLSelectElement>) {
        const type = event.target.value;
        const newTerm = { ...oldTerm, type };
        this.args.updateSearchTerm(oldTerm, newTerm);
    }
}
