import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';

interface PageSidebarWidgetsYourInterestsArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsYourInterests extends Component<PageSidebarWidgetsYourInterestsArgs> {
    @service ajax!: AjaxService;

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.YOUR_INTERESTS;
}
