import Component from '@glimmer/component';

import Document from 'pep/pods/document/model';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsMostCitedItemArgs {
    item: Document;
}

export default class PageSidebarWidgetsMostCitedItem extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsMostCitedItemArgs>
> {
    get queryParams() {
        const smartSearchTerm = this.args.item.id.split('.');
        return {
            q: `${smartSearchTerm[0]}.${smartSearchTerm[1]}.*`
        };
    }
}
