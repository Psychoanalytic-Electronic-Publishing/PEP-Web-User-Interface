import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';

interface PageSidebarWidgetsExpertPicksArgs {}

export default class PageSidebarWidgetsExpertPicks extends Component<PageSidebarWidgetsExpertPicksArgs> {
    @service ajax!: AjaxService;
    @tracked isOpen = false;
}
