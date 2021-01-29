import Component from '@glimmer/component';

interface BrowseSidebarItemArgs {
    highlight: boolean;
    item: any;
    route: string;
}

export default class BrowseSidebarItem extends Component<BrowseSidebarItemArgs> {}
