import Component from '@glimmer/component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface BrowseSidebarItemArgs {
    item: any;
    route: string;
}

export default class BrowseSidebarItem extends Component<BaseGlimmerSignature<BrowseSidebarItemArgs>> {}
