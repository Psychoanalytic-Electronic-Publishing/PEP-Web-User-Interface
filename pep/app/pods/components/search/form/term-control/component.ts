import Component from '@glimmer/component';
// import { action, computed } from '@ember/object';
// import { later, next } from '@ember/runloop';
// import { inject as service } from '@ember/service';
// import IntlService from 'ember-intl/services/intl';

import {
    SEARCH_TYPES,
    SearchTermValue
    // SearchTermId
} from 'pep/constants/search';
// import ScrollableService from 'pep/services/scrollable';
// import { fadeTransition } from 'pep/utils/animation';

interface SearchFormTermControlArgs {
    searchTerm: SearchTermValue;
    onTermTextChange: (searchTerm: SearchTermValue, event: HTMLElementEvent<HTMLInputElement>) => void;
    updateTermType: (oldTerm: SearchTermValue, event: HTMLElementEvent<HTMLSelectElement>) => void;
    removeSearchTerm: (searchTerm: SearchTermValue) => void;
}

export default class SearchFormTermControl extends Component<SearchFormTermControlArgs> {
    get searchTypeOptions() {
        return SEARCH_TYPES.filter((t) => t.isTypeOption);
    }
}
