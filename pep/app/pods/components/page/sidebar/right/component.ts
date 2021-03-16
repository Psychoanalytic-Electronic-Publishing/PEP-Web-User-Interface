import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import ConfigurationService from 'pep/services/configuration';
import { WidgetData } from 'pep/constants/sidebar';
import { WidgetSide } from 'pep/constants/configuration';

interface PageSidebarRightArgs {
    data: WidgetData;
}

export default class PageSidebarRight extends Component<PageSidebarRightArgs> {
    @service configuration!: ConfigurationService;

    get rightSidebarWidgets() {
        return this.configuration.base.global.cards.right;
    }
}
