import Evented from '@ember/object/evented';
import Service from '@ember/service';

export default class ScrollableService extends Service.extend(Evented) {
    /**
     * Triggers an event to tell <Scrollable>s to scroll to top
     * optionally filtered to only those with the provided namespace
     * @param {String} namespace
     */
    scrollToTop(namespace?: string) {
        this.trigger('scrollToTop', namespace);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        scrollable: ScrollableService;
    }
}
