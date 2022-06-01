import Component from '@glimmer/component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface SearchFormSavedSearchesArgs {}

export default class SearchFormSavedSearches extends Component<BaseGlimmerSignature<SearchFormSavedSearchesArgs>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Search::Form::SavedSearches': typeof SearchFormSavedSearches;
    }
}
