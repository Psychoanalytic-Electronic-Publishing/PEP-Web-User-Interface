import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

import AjaxService from 'pep/services/ajax';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';

interface PageSidebarWidgetsGlossaryTermsArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsGlossaryTerms extends Component<PageSidebarWidgetsGlossaryTermsArgs> {
    @service ajax!: AjaxService;

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.GLOSSARY_TERMS;
}
