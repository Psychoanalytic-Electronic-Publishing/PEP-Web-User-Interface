import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';

interface PageSidebarWidgetsPastSearchesArgs {}

export default class PageSidebarWidgetsPastSearches extends Component<PageSidebarWidgetsPastSearchesArgs> {
    @service ajax!: AjaxService;
    @tracked isOpen = false;
}
