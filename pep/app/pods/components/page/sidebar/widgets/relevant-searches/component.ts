import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';

interface PageSidebarWidgetsRelevantSearchesArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsRelevantSearches extends Component<PageSidebarWidgetsRelevantSearchesArgs> {
    @service ajax!: AjaxService;

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.RELEVANT_SEARCHES;
}
