import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import MediaService from 'ember-responsive/services/media';

import ScrollableService from 'pep/services/scrollable';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface ScrollableArgs {
    namespace?: string;
    onInsert?: (element: HTMLElement) => void;
}

export default class Scrollable extends Component<BaseGlimmerSignature<ScrollableArgs>> {
    @service media!: MediaService;
    @service fastboot!: FastbootService;
    @service scrollable!: ScrollableService;

    ps: PerfectScrollbar | null = null;
    scrollElement: HTMLElement | null = null;
    resizeDebounceDelay: number = 250;

    /**
     * Update the scrollable instance when the device media/dimensions change
     * @param {unknown} owner
     * @param {ScrollableArgs} args
     */
    constructor(owner: unknown, args: ScrollableArgs) {
        super(owner, args);
        this.handleMediaChange();
        this.media.on('mediaChanged', this, this.handleMediaChange);
        this.scrollable.on('recalculate', this, this.handleRecalculate);
        this.scrollable.on('scrollToTop', this, this.handleScrollToTop);
    }

    /**
     * Destroy PerfectScrollbar instance and remove listeners
     */
    willDestroy() {
        this.media.off('mediaChanged', this, this.handleMediaChange);
        this.scrollable.off('recalculate', this, this.handleRecalculate);
        this.scrollable.off('scrollToTop', this, this.handleScrollToTop);
        this.teardown();
    }

    /**
     * Setup the perfect scrollbar instance
     * @param {HTMLElement} element
     */
    setup(element: HTMLElement | null) {
        if (element && !this.ps && !this.fastboot.isFastBoot) {
            const ps = new PerfectScrollbar(element, {
                //@see https://github.com/mdbootstrap/perfect-scrollbar#options
                wheelSpeed: 1
            });
            this.ps = ps;
        }
    }

    /**
     * Destroy the perfect scrollbar instance
     */
    teardown() {
        if (this.ps) {
            this.ps.destroy();
            this.ps = null;
        }
    }

    /**
     * Recalculates the PerfectScrollbar scroll height when
     * receiving an event from the Scrollable service
     * @param {String} namespace
     */
    handleRecalculate(namespace?: string) {
        if ((!namespace || this.args.namespace === namespace) && this.ps) {
            this.ps.update();
        }
    }

    /**
     * Scrolls the <Scrollable> to top when
     * receiving an event from the Scrollable service
     * @param {String} namespace
     */
    handleScrollToTop(namespace?: string) {
        if ((!namespace || this.args.namespace === namespace) && this.scrollElement) {
            this.scrollElement.scrollTop = 0;
        }
    }

    /**
     * Handles changes to the device media/size
     * Disable perfect-scrollbar in mobile as it doesnt support momentum scrolling
     */
    handleMediaChange() {
        if (this.media.isMobile || this.media.isTablet) {
            this.teardown();
        } else {
            this.setup(this.scrollElement);
        }
    }

    /**
     * Setup the perfect scrollbar instance on render
     * @param {HTMLElement} element
     */
    @action
    onElementInsert(element: HTMLElement) {
        this.scrollElement = element;
        if (!this.media.isMobile && !this.media.isTablet) {
            this.setup(element);
        }

        if (this.args.onInsert) {
            this.args.onInsert(element);
        }
    }

    /**
     * When the container element resizes, make sure the PerfectScrollbar
     * instance is updated with the new scroll height
     */
    @action
    onResize() {
        if (this.ps) {
            this.ps.update();
        }
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        Scrollable: typeof Scrollable;
    }
}
