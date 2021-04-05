import { action } from '@ember/object';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';

import {
    SIDEBAR_HANDLE_WIDTH, SIDEBAR_MAX_WIN_PCT_DESKTOP, SIDEBAR_MAX_WIN_PCT_TABLET, SIDEBAR_WIDTH
} from 'pep/constants/dimensions';
import FastbootMediaService from 'pep/services/fastboot-media';
import SidebarService from 'pep/services/sidebar';
import { clamp } from 'pep/utils/math';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarArgs {
    side: 'left' | 'right';
    resizable?: boolean;
    minWidth?: number;
    maxWidth?: number;
}

export default class PageSidebar extends Component<BaseGlimmerSignature<PageSidebarArgs>> {
    @service sidebar!: SidebarService;
    @service fastbootMedia!: FastbootMediaService;

    @tracked windowWidth: number = 0;
    @tracked isResizing: boolean = false;
    startingResizeWidth: number = 0;
    innerElement?: HTMLDivElement;

    get resizable() {
        return this.args.resizable ?? true;
    }

    get minWidth() {
        return this.args.minWidth ?? SIDEBAR_WIDTH;
    }

    /**
     * Sidebars default to a max width that is a percentage of the total window width
     * depending on the device type/size (desktop vs. tablet)
     * @readonly
     * @returns {number}
     */
    get maxWidth() {
        const pct = this.fastbootMedia.isTablet ? SIDEBAR_MAX_WIN_PCT_TABLET : SIDEBAR_MAX_WIN_PCT_DESKTOP;
        return this.args.maxWidth ?? Math.max(this.minWidth, this.windowWidth * pct);
    }

    /**
     * Dont allow resizing on mobile since the sidebar is modal (has a backdrop)
     * and should take up most of the viewport already
     * @readonly
     * @returns {boolean}
     */
    get canResize() {
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
        const width = this.resizedWidth ?? 0;
        const transform = !this.isOpen ? `transform: translateX(${this.isLeft ? -width : 0}px);` : '';
        return width ? htmlSafe(`width: ${width}px; ${transform}`) : null;
    }

    /**
     * Proxies storing of the sidebar's resized width to the sidebar service
     * so the width is preserved if the sidebar is re-rendered on another page
     * @returns {number}
     */
    get resizedWidth() {
        return this.sidebar[this.isRight ? 'rightSidebarWidth' : 'leftSidebarWidth'] ?? 0;
    }
    set resizedWidth(width: number) {
        this.sidebar[this.isRight ? 'rightSidebarWidth' : 'leftSidebarWidth'] = width;
    }

    /**
     * Store a reference to the sidebar inner element and the current window width for resizing purposes
     * @param {HTMLElemeHTMLDivElementnt} element
     */
    @action
    onElementInsert(element: HTMLDivElement) {
        this.innerElement = element;
        this.windowWidth = document.body.offsetWidth;
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
        this.startingResizeWidth = 0;
        next(this, () => (this.isResizing = false));
    }

    /**
     * Updates the current window width and ensures the sidebar's
     * resized width does not extend beyond the max width
     * @param {number} width
     */
    @action
    onWindowResize(width: number) {
        this.windowWidth = width;
        if (this.resizedWidth) {
            this.resizedWidth = clamp(this.resizedWidth, this.minWidth, this.maxWidth);
        }
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Sidebar': typeof PageSidebar;
    }
}
