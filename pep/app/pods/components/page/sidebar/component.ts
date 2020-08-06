import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import MediaService from 'ember-responsive/services/media';
import SidebarService from 'pep/services/sidebar';

interface PageSidebarArgs {
    side: 'left' | 'right';
}

export default class PageSidebar extends Component<PageSidebarArgs> {
    @service sidebar!: SidebarService;
    @service media!: MediaService;

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

    /**
     * Toggles the open/closed state of the sidebar
     */
    @action
    toggle() {
        return this.isLeft ? this.sidebar.toggleLeftSidebar() : this.sidebar.toggleRightSidebar();
    }
}
