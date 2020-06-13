import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class Sidebar extends Service {
    @service media;
    @tracked leftSidebarIsOpen = true;
    @tracked rightSidebarIsOpen = true;

    constructor() {
        super(...arguments);
        this.handleMediaChange();
        this.media.on('mediaChanged', this, this.handleMediaChange);
    }

    toggleLeftSidebar() {
        this.leftSidebarIsOpen = !this.leftSidebarIsOpen;
        //only allow one sidebar open at a time on mobile
        if (this.leftSidebarIsOpen && this.media.isMobile) {
            this.rightSidebarIsOpen = false;
        }
    }

    toggleRightSidebar() {
        this.rightSidebarIsOpen = !this.rightSidebarIsOpen;
        //only allow one sidebar open at a time on mobile
        if (this.rightSidebarIsOpen && this.media.isMobile) {
            this.leftSidebarIsOpen = false;
        }
    }

    private handleMediaChange() {
        //default sidebars to closed on mobile/tablet
        if (this.media.isMobile || this.media.isTablet) {
            this.leftSidebarIsOpen = false;
            this.rightSidebarIsOpen = false;
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        sidebar: Sidebar;
    }
}
