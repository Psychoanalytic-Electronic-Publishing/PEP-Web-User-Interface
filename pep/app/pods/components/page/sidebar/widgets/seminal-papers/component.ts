import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import AjaxService from 'pep/services/ajax';

interface PageSidebarWidgetsSeminalPapersArgs {}

export default class PageSidebarWidgetsSeminalPapers extends Component<PageSidebarWidgetsSeminalPapersArgs> {
    @service ajax!: AjaxService;
    @tracked isOpen = false;
}
