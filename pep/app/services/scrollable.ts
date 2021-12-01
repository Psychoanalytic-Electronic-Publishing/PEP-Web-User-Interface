import Evented from '@ember/object/evented';
import Service from '@ember/service';

export default class ScrollableService extends Service.extend(Evented) {
    /**
     * Triggers an event to tell <Scrollable>s to update their scroll height
     * optionally filtered to only those with the provided namespace
     * @param {String} namespace
     */
    recalculate(namespace?: string) {
        this.trigger('recalculate', namespace);
    }

    /**
     * Triggers an event to tell <Scrollable>s to scroll to top
     * optionally filtered to only those with the provided namespace
     * @param {String} namespace
     */
    scrollToTop(namespace?: string) {
        this.trigger('scrollToTop', namespace);
    }

    /**
     * Triggers a reinitializing of the scroll bars. This is due to issues serving the plain index.html page without fastboot and a FOUC.
     * Fixes the issue of not being able to scroll when the above case happens.
     *
     * @param {string} [namespace]
     * @memberof ScrollableService
     */
    reinitialize(namespace?: string) {
        this.trigger('reinitialize', namespace);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        scrollable: ScrollableService;
    }
}
