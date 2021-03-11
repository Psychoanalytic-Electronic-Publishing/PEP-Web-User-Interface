import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import SidebarService from 'pep/services/sidebar';

interface PageSidebarLeftArgs {}

export default class PageSidebarLeft extends Component<PageSidebarLeftArgs> {
    @service sidebar!: SidebarService;
}
