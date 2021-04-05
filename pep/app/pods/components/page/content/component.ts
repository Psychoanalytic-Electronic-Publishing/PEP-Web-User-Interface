import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageContentArgs {
    scrollableNamespace?: string;
}

export default class PageContent extends Component<BaseGlimmerSignature<PageContentArgs>> {
    get scrollableNamespace() {
        return this.args.scrollableNamespace ?? 'page-content';
    }
}
