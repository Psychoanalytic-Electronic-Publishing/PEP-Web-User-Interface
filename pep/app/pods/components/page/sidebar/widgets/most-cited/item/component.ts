import Component from '@glimmer/component';

import Document from 'pep/pods/document/model';

interface PageSidebarWidgetsMostCitedItemArgs {
    item: Document;
}

export default class PageSidebarWidgetsMostCitedItem extends Component<PageSidebarWidgetsMostCitedItemArgs> {
    get queryParams() {
        const smartSearchTerm = this.args.item.id.split('.');
        return {
            q: `${smartSearchTerm[0]}.${smartSearchTerm[1]}.*`
        };
    }
}
