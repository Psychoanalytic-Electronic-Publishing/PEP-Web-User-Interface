import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';

interface PageSidebarWidgetsRevelantSearchesArgs {}

export default class PageSidebarWidgetsRevelantSearches extends Component<PageSidebarWidgetsRevelantSearchesArgs> {
    @service ajax!: AjaxService;
    @tracked isOpen = false;
}
