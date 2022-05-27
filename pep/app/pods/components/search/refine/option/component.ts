import Component from '@glimmer/component';

import { SearchFacetValue } from 'pep/constants/search';
import { RefineOption } from 'pep/pods/components/search/refine/component';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface SearchRefineOptionArgs {
    facetId: string;
    selection: SearchFacetValue[];
    option: RefineOption;
    onFacetChange: (facetId: string, optionId: string) => void;
}

export default class SearchRefineOption extends Component<BaseGlimmerSignature<SearchRefineOptionArgs>> {
    get isChecked() {
        return !!this.args.selection.find(
            (facet) => facet.id === this.args.facetId && facet.value === this.args.option.id
        );
    }
}
