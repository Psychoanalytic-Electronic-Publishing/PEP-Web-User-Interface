import { inject } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import moment from 'moment';
import { AspectRatio } from 'pep/constants/configuration';
import { MEDIA_FILE_EXTENSION_REGEX } from 'pep/constants/regex';
import { WIDGET } from 'pep/constants/sidebar';
import { BasePageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsTopicalVideoPreviewArgs extends BasePageSidebarWidgetArgs {}

export default class PageSidebarWidgetsTopicalVideoPreview extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsTopicalVideoPreviewArgs>
> {
    @inject configuration!: ConfigurationService;

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    get videoIndex() {
        const videos = this.configuration.base.global.cards.topicalVideoPreviews;
        const specialDate = this.configuration.base.home.expertPicksStartDate;
        const dayDifferential = moment(new Date()).diff(specialDate, 'days');
        return dayDifferential % videos.length;
    }

    get video() {
        const videos = this.configuration.base.global.cards.topicalVideoPreviews;
        return videos[this.videoIndex];
    }

    get aspectRatio() {
        return this.video.aspectRatio ?? AspectRatio.SIXTEEN_BY_NINE;
    }

    get videoPreviewThumbnail() {
        return `${this.video.url.replace(MEDIA_FILE_EXTENSION_REGEX, '')}.jpg`;
    }

    widget = WIDGET.TOPICAL_VIDEO_PREVIEW;
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Sidebar::Widgets::TopicalVideoPreview': typeof PageSidebarWidgetsTopicalVideoPreview;
    }
}
