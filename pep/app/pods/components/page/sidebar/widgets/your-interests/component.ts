import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { WIDGET } from 'pep/constants/sidebar';
import { BasePageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import AjaxService from 'pep/services/ajax';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsYourInterestsArgs extends BasePageSidebarWidgetArgs {}

export default class PageSidebarWidgetsYourInterests extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsYourInterestsArgs>
> {
    @service ajax!: AjaxService;

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.YOUR_INTERESTS;
}
