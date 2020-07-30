import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import {
    SEARCH_TYPES,
    SEARCH_TYPE_EVERYWHERE,
    SEARCH_RESULTS_WARNING_COUNT,
    SearchTermValue
} from 'pep/constants/search';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';
import { TransitionArgs } from 'ember-animated';

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
     * ember-animated transition for panel collapse/expand
     * @param {TransitionArgs}
     */
    *animateTransition({ keptSprites, removedSprites, insertedSprites }: TransitionArgs) {
        for (let sprite of keptSprites) {
            move(sprite);
        }

        for (let sprite of removedSprites) {
            fadeOut(sprite);
        }

        for (let sprite of insertedSprites) {
            fadeIn(sprite);
        }
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
