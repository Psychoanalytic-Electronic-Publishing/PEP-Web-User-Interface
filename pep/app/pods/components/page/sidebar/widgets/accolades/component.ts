import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsAccoladesArgs {}

export default class PageSidebarWidgetsAccolades extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsAccoladesArgs>
> {
    @service configuration!: ConfigurationService;
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Sidebar::Widgets::Accolades': typeof PageSidebarWidgetsAccolades;
    }
}
