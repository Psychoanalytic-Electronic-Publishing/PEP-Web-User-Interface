import Service from '@ember/service';
import { inject as service } from '@ember/service';
import MediaService from 'ember-responsive/services/media';
import UserAgentService from 'ember-useragent/services/user-agent';
import FastbootService from 'ember-cli-fastboot/services/fastboot';

export default class FastbootMedia extends Service {
    @service fastboot!: FastbootService;
    @service media!: MediaService;
    @service userAgent!: UserAgentService;

    /**
     * Isomorphic media/device check for mobile, using the user agent in fastboot
     */
    get isMobile() {
        return this.media.isMobile || (this.fastboot.isFastBoot && this.userAgent.device.isMobile);
    }

    /**
     * Isomorphic media/device check for tablet, using the user agent in fastboot
     */
    get isTablet() {
        return this.media.isTablet || (this.fastboot.isFastBoot && this.userAgent.device.isTablet);
    }

    /**
     * Isomorphic media/device check for desktop, using the user agent in fastboot
     */
    get isDesktop() {
        return this.media.isDesktop || (this.fastboot.isFastBoot && this.userAgent.device.isDesktop);
    }

    /**
     * Device is mobile or tablet
     */
    get isSmallDevice() {
        return this.isMobile || this.isTablet;
    }

    /**
     * Pass-through for ember-responsive's media.on()
     * @param {String} event
     * @param {any} target
     * @param {Function} func
     */
    on(event: string, target: any, func: Function) {
        return this.media.on(event, target, func);
    }
}

declare module '@ember/service' {
    interface Registry {
        'fastboot-media': FastbootMedia;
    }
}
