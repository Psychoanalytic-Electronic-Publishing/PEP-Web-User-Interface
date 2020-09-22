import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';

interface PageSidebarWidgetsSeminalPapersArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsSeminalPapers extends Component<PageSidebarWidgetsSeminalPapersArgs> {
    @service ajax!: AjaxService;

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.SEMINAL_PAPERS;
}
