import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import { SEARCH_TYPES, SearchTermValue } from 'pep/constants/search';
import ConfigurationService from 'pep/services/configuration';

interface SearchFormTermControlArgs {
    searchTerm: SearchTermValue;
    onTermTextChange: (searchTerm: SearchTermValue, event: HTMLElementEvent<HTMLInputElement>) => void;
    updateTermType: (oldTerm: SearchTermValue, event: HTMLElementEvent<HTMLSelectElement>) => void;
    removeSearchTerm: (searchTerm: SearchTermValue) => void;
}

export default class SearchFormTermControl extends Component<SearchFormTermControlArgs> {
    @service configuration!: ConfigurationService;

    get searchTypeOptions() {
        return SEARCH_TYPES.filter((t) => t.isTypeOption);
    }

    get selectedSearchType() {
        return SEARCH_TYPES.find((t) => t.id === this.args.searchTerm?.type);
    }

    get termContentConfig() {
        return this.args.searchTerm ? this.configuration.content.search.terms.types[this.args.searchTerm.type] : null;
    }
}