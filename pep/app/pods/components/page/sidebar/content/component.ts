import Component from '@glimmer/component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarContentArgs {
    scrollableNamespace?: string;
}

export default class PageSidebarContent extends Component<BaseGlimmerSignature<PageSidebarContentArgs>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Sidebar::Content': typeof PageSidebarContent;
    }
}
