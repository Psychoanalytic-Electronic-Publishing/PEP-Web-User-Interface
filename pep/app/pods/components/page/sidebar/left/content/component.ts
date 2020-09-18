import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ConfigurationService from 'pep/services/configuration';
import { inject as service } from '@ember/service';
import { WidgetData } from 'pep/constants/sidebar';
interface PageSidebarLeftContentArgs {
    data: WidgetData;
}

export default class PageSidebarLeftContent extends Component<PageSidebarLeftContentArgs> {
    @service configuration!: ConfigurationService;

    get leftSidebarWidgets() {
        return this.configuration.base.global.cards.left;
    }
}
