import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import { WidgetData } from 'pep/constants/sidebar';
import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarLeftContentArgs {
    data: WidgetData;
    hideWidgets?: boolean;
}

export default class PageSidebarLeftContent extends Component<BaseGlimmerSignature<PageSidebarLeftContentArgs>> {
    @service configuration!: ConfigurationService;

    get leftSidebarWidgets() {
        return this.configuration.base.global.cards.left;
    }
}
