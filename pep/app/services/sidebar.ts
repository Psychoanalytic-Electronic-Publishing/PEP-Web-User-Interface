import Service from '@ember/service';
import { isNone } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

import FastbootMediaService from 'pep/services/fastboot-media';
import { WidgetData } from 'pep/constants/sidebar';

export default class SidebarService extends Service {
    @service fastbootMedia!: FastbootMediaService;
    @tracked leftSidebarIsOpen = true;
    @tracked rightSidebarIsOpen = true;
    @tracked data = {};

    get hasOpenSidebar() {
        return this.leftSidebarIsOpen || this.rightSidebarIsOpen;
    }

    /**
     * Close the sidebars by default on mobile
     */
    constructor() {
        super(...arguments);
        this.handleMediaChange();
        this.fastbootMedia.on('mediaChanged', this, this.handleMediaChange);
    }

    /**
     * Toggles the state of the left sidebar
     * @param {Boolean} open
     */
    toggleLeftSidebar(open?: boolean) {
        this.leftSidebarIsOpen = !isNone(open) ? open : !this.leftSidebarIsOpen;
        //only allow one sidebar open at a time on mobile
        if (this.leftSidebarIsOpen && this.fastbootMedia.isMobile) {
            this.rightSidebarIsOpen = false;
        }
    }

    /**
     * Toggles the state of the right sidebar
     * @param {Boolean} open
     */
    toggleRightSidebar(open?: boolean) {
        this.rightSidebarIsOpen = !isNone(open) ? open : !this.rightSidebarIsOpen;
        //only allow one sidebar open at a time on mobile
        if (this.rightSidebarIsOpen && this.fastbootMedia.isMobile) {
            this.leftSidebarIsOpen = false;
        }
    }

    /**
     * Toggles the state of both sidebars
     * @param {Boolean} open
     */
    toggleAll(open?: boolean) {
        this.toggleLeftSidebar(open);
        this.toggleRightSidebar(open);
    }

    /**
     * Update the data thats sent to the left sidebar and right sidebar widgets
     *
     * @param {WidgetData} data
     * @memberof SidebarService
     */
    update(data: WidgetData) {
        this.data = {
            ...this.data,
            ...data
        };
    }

    /**
     * Default sidebars to closed on mobile/tablet
     * @private
     */
    private handleMediaChange() {
        if (this.fastbootMedia.isSmallDevice) {
            this.leftSidebarIsOpen = false;
            this.rightSidebarIsOpen = false;
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        sidebar: SidebarService;
    }
}
