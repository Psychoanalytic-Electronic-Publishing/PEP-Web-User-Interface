import Service from '@ember/service';
import { isNone } from '@ember/utils';
import { tracked } from '@glimmer/tracking';
// import { inject as service } from '@ember/service';
// import FastbootMediaService from './fastboot-media';

export default class DrawerService extends Service {
    // @service fastbootMedia!: FastbootMediaService;
    @tracked isOpen = false;

    /**
     * Toggles the state of the page drawer navigation
     * @param {Boolean} open
     */
    toggle(open?: boolean) {
        this.isOpen = !isNone(open) ? open : !this.isOpen;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        drawer: DrawerService;
    }
}
