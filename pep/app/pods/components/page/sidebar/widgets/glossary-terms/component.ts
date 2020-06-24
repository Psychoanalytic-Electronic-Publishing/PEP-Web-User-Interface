import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import AjaxService from 'pep/services/ajax';

interface PageSidebarWidgetsGlossaryTermsArgs {}

export default class PageSidebarWidgetsGlossaryTerms extends Component<PageSidebarWidgetsGlossaryTermsArgs> {
    @service ajax!: AjaxService;
    @tracked isOpen = false;
}
