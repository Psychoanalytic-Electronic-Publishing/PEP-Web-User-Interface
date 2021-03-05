import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { WidgetData } from 'pep/constants/sidebar';
import ConfigurationService from 'pep/services/configuration';

interface PageSidebarLeftContentArgs {
    data: WidgetData;
    hideWidgets?: boolean;
}

export default class PageSidebarLeftContent extends Component<PageSidebarLeftContentArgs> {
    @service configuration!: ConfigurationService;

    get leftSidebarWidgets() {
        return this.configuration.base.global.cards.left;
    }
}
