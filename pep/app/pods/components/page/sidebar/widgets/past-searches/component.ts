import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import { WIDGET } from 'pep/constants/sidebar';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import AjaxService from 'pep/services/ajax';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsPastSearchesArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsPastSearches extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsPastSearchesArgs>
> {
    @service ajax!: AjaxService;

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.PAST_SEARCHES;
}
