import Component from '@glimmer/component';

interface PageContentArgs {
    scrollableNamespace?: string;
}

export default class PageContent extends Component<PageContentArgs> {
    get scrollableNamespace() {
        return this.args.scrollableNamespace ?? 'page-content';
    }
}
