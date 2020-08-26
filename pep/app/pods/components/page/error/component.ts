import Component from '@glimmer/component';

interface PageErrorArgs {
    heading: string;
    subheading: string;
    message: string;
}

export default class PageError extends Component<PageErrorArgs> {}
