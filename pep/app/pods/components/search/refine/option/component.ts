import Component from '@glimmer/component';
import { SearchFacetValue } from 'pep/constants/search';
import { RefineOption } from '../component';

interface SearchRefineOptionArgs {
    facetId: string;
    selection: SearchFacetValue[];
    option: RefineOption;
    onFacetChange: (facetId: string, optionId: string) => void;
}

export default class SearchRefineOption extends Component<SearchRefineOptionArgs> {
    get isChecked() {
        return !!this.args.selection.find(
            (facet) => facet.id === this.args.facetId && facet.value === this.args.option.id
        );
    }
}
