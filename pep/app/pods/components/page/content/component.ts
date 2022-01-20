import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageContentArgs {
    scrollableNamespace?: string;
    scrollable?: boolean;
}

export default class PageContent extends Component<BaseGlimmerSignature<PageContentArgs>> {
    get scrollableNamespace() {
        return this.args.scrollableNamespace ?? 'page-content';
    }

    get scrollable() {
        return this.args.scrollable ?? true;
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Content': typeof PageContent;
    }
}
