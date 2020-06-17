import Component from '@glimmer/component';
import { action, computed } from '@ember/object';
import { SEARCH_TYPES, SEARCH_TYPE_EVERYWHERE } from 'pep/constants/search';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';

interface SearchFormArgs {
    //TODO
}

export default class SearchForm extends Component<SearchFormArgs> {
    searchTypes = SEARCH_TYPES;

    *termsTransition({ keptSprites, removedSprites, insertedSprites }) {
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

    @computed('args.{smartSearchTerm,searchTerms.@each.term}')
    get hasEnteredSearch() {
        return (
            this.args.smartSearchTerm ||
            (Array.isArray(this.args.searchTerms) && this.args.searchTerms.filter((t) => !!t.term).length > 0)
        );
    }

    @action
    addSearchTerm() {
        this.args.addSearchTerm({
            type: SEARCH_TYPE_EVERYWHERE.id,
            term: ''
        });
    }

    @action
    updateTermType(oldTerm, event) {
        const type = event.target.value;
        const newTerm = { ...oldTerm, type };
        this.args.updateSearchTerm(oldTerm, newTerm);
    }
}
