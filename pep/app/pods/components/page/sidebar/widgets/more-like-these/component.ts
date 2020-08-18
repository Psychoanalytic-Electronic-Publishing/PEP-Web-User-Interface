import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';

interface PageSidebarWidgetsMoreLikeTheseArgs {}

export default class PageSidebarWidgetsMoreLikeThese extends Component<PageSidebarWidgetsMoreLikeTheseArgs> {
    @service ajax!: AjaxService;
    @tracked isOpen = false;
}
