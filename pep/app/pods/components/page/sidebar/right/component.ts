import { WidgetData } from 'pep/constants/sidebar';
import ConfigurationService from 'pep/services/configuration';
import PepSessionService from 'pep/services/session';

import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

interface PageSidebarRightArgs {
    data: WidgetData;
}

export default class PageSidebarRight extends Component<PageSidebarRightArgs> {
    @service configuration!: ConfigurationService;
    @service session!: PepSessionService;

    get rightSidebarWidgets() {
        return this.configuration.base.global.cards.right;
    }
}
