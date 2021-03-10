import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { WidgetData } from 'pep/constants/sidebar';
import SidebarService from 'pep/services/sidebar';

interface PageSidebarLeftArgs {
    data: WidgetData;
}

export default class PageSidebarLeft extends Component<PageSidebarLeftArgs> {
    @service sidebar!: SidebarService;
}
