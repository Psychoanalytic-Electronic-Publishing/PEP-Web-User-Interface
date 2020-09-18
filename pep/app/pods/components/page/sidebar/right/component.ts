import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ConfigurationService from 'pep/services/configuration';
import { inject as service } from '@ember/service';
import { WidgetData } from 'pep/constants/sidebar';
interface PageSidebarRightArgs {
    data: WidgetData;
}

export default class PageSidebarRight extends Component<PageSidebarRightArgs> {
    @service configuration!: ConfigurationService;

    get rightSidebarWidgets() {
        return this.configuration.base.global.cards.right;
    }
}
