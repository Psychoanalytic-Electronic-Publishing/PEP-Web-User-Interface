import Component from '@glimmer/component';

interface BrowseTabArgs {
    filter: string;
    count: number;
    icon: string;
}

export default class BrowseTab extends Component<BrowseTabArgs> {}
