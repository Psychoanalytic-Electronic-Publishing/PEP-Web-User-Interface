import Component from '@glimmer/component';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';

interface PageSidebarWidgetsRelatedDocumentsArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsRelatedDocuments extends Component<PageSidebarWidgetsRelatedDocumentsArgs> {
    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.RELATED_DOCUMENTS;
}
