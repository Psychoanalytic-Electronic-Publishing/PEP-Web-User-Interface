import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { htmlSafe } from '@ember/template';

import SidebarService from 'pep/services/sidebar';
import FastbootMediaService from 'pep/services/fastboot-media';
import { SIDEBAR_HANDLE_WIDTH } from 'pep/constants/dimensions';

interface PageSidebarArgs {
    side: 'left' | 'right';
    resizable?: boolean;
    minWidth?: number;
    maxWidth?: number;
}

export default class PageSidebar extends Component<PageSidebarArgs> {
    @service sidebar!: SidebarService;
    @service fastbootMedia!: FastbootMediaService;

    @tracked resizedWidth?: number;
    @tracked windowWidth: number = 0;
    @tracked isResizing: boolean = false;
    startingResizeWidth: number = 0;
    innerElement?: HTMLDivElement;

    get resizable() {
        return this.args.resizable ?? true;
    }

    get minWidth() {
        return this.args.minWidth ?? 300;
    }

    get maxWidth() {
        //TODO make this dynamic to be 35%~ of the current window size using a window resize listener
        //and also adjust current width if its >maxWidth after a window resize
        return this.args.maxWidth ?? 500;
    }

    get canResize() {
        // dont allow resizing on mobile since the sidebar is modal (has a backdrop)
        // and should take up most of the viewport already
        return this.resizable && !this.fastbootMedia.isMobile;
    }

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

    get sidebarStyles() {
        return this.resizedWidth && this.isOpen
            ? htmlSafe(`width: ${this.resizedWidth + SIDEBAR_HANDLE_WIDTH}px;`)
            : null;
    }

    get sidebarInnerStyles() {
        return this.resizedWidth && this.isOpen ? htmlSafe(`width: ${this.resizedWidth}px;`) : null;
    }

    /**
     * Store a reference to the sidebar inner element for resizing purposes
     * @param {HTMLElemeHTMLDivElementnt} element
     */
    @action
    onElementInsert(element: HTMLDivElement) {
        this.innerElement = element;
    }

    /**
     * Toggles the open/closed state of the sidebar
     */
    @action
    toggle() {
        return this.isLeft ? this.sidebar.toggleLeftSidebar() : this.sidebar.toggleRightSidebar();
    }

    /**
     * When drag resizing starts, set the pane to not animate height changes
     */
    @action
    onDragStart() {
        this.startingResizeWidth = this.innerElement?.offsetWidth ?? 0;
        this.isResizing = true;
    }

    /**
     * While drag resizing, resizes the sidebar to match the current size
     */
    @action
    onDragMove(position: number) {
        this.resizedWidth = this.isRight ? this.startingResizeWidth - position : position;
    }

    /**
     * When drag resizing ends, update the sidebar with the new width
     * @param {number} position
     */
    @action
    onDragEnd(position: number) {
        this.resizedWidth = this.isRight ? this.startingResizeWidth - position : position;
        // TODO need to persist resize widths to sidebar service - so the width is preserved if the sidebars are re-rendered on another page
        this.startingResizeWidth = 0;
        next(this, () => (this.isResizing = false));
    }
}
