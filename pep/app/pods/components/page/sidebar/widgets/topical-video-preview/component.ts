import { inject } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import { WIDGET } from 'pep/constants/sidebar';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsTopicalVideoPreviewArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsTopicalVideoPreview extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsTopicalVideoPreviewArgs>
> {
    @inject configuration!: ConfigurationService;

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    /**
     * Get aspect ratio
     *
     * @readonly
     * @memberof PageSidebarWidgetsTopicalVideoPreview
     */
    get aspectRatio() {
        return this.configuration.base.global.cards.topicalVideoPreview.aspectRatio;
    }

    widget = WIDGET.TOPICAL_VIDEO_PREVIEW;
}
