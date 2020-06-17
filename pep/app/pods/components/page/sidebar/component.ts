import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Sidebar from 'pep/services/sidebar';

interface PageSidebarArgs {
    side: 'left' | 'right';
}

export default class PageSidebar extends Component<PageSidebarArgs> {
    @service sidebar!: Sidebar;
    @service media;

    get isLeft() {
        return this.args.side === 'left';
    }

    get isRight() {
        return this.args.side === 'right';
    }

    get isOpen() {
        return this.isLeft ? this.sidebar.leftSidebarIsOpen : this.sidebar.rightSidebarIsOpen;
    }

    get otherSidebarIsOpen() {
        return this.isLeft ? this.sidebar.rightSidebarIsOpen : this.sidebar.leftSidebarIsOpen;
    }

    @action
    toggle() {
        return this.isLeft ? this.sidebar.toggleLeftSidebar() : this.sidebar.toggleRightSidebar();
    }
}
