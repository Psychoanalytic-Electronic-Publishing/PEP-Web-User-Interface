import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';

interface PageSidebarWidgetsYourInterestsArgs {}

export default class PageSidebarWidgetsYourInterests extends Component<PageSidebarWidgetsYourInterestsArgs> {
    @service ajax!: AjaxService;
    @tracked isOpen = false;
}
