import Component from '@glimmer/component';
import ConfigurationService from 'pep/services/configuration';
import { inject } from '@ember/service';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';

interface PageSidebarWidgetsVideoPreviewArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsVideoPreview extends Component<PageSidebarWidgetsVideoPreviewArgs> {
    @inject configuration!: ConfigurationService;

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.VIDEO_PREVIEW;
}
