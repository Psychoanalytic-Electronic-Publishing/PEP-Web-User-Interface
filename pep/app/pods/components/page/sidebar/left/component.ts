import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import SidebarService from 'pep/services/sidebar';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarLeftArgs {}

export default class PageSidebarLeft extends Component<BaseGlimmerSignature<PageSidebarLeftArgs>> {
    @service sidebar!: SidebarService;
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Sidebar::Left': typeof PageSidebarLeft;
    }
}
