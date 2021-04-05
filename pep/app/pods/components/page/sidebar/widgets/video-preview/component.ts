import { inject } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import { WIDGET } from 'pep/constants/sidebar';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsVideoPreviewArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsVideoPreview extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsVideoPreviewArgs>
> {
    @inject configuration!: ConfigurationService;

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.VIDEO_PREVIEW;
}
