import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ConfigurationService from 'pep/services/configuration';
import { inject } from '@ember/service';
import { WidgetData } from 'pep/constants/sidebar';
interface PageSidebarRightArgs {
    data: WidgetData;
}

export default class PageSidebarRight extends Component<PageSidebarRightArgs> {
    @inject configuration!: ConfigurationService;
    @tracked rightSidebarWidgets = this.configuration.base.global.cards.right;
}
