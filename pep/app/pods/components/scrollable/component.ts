import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import MediaService from 'ember-responsive/services/media';

import ScrollableService from 'pep/services/scrollable';

interface ScrollableArgs {
    namespace?: string;
    onInsert?: (element: HTMLElement) => void;
}

interface ScrollableSignature {
    Args: ScrollableArgs;
    Blocks: { default: [] };
    Element: HTMLDivElement;
}

export default class Scrollable extends Component<ScrollableSignature> {
    @service media!: MediaService;
    @service fastboot!: FastbootService;
    @service scrollable!: ScrollableService;

    scrollElement: HTMLElement | null = null;
    resizeDebounceDelay: number = 250;

    /**
     * Update the scrollable instance when the device media/dimensions change
     * @param {unknown} owner
     * @param {ScrollableArgs} args
     */
    constructor(owner: unknown, args: ScrollableArgs) {
        super(owner, args);
        this.scrollable.on('scrollToTop', this, this.handleScrollToTop);
    }

    /**
     * Destroy PerfectScrollbar instance and remove listeners
     */
    willDestroy() {
        this.scrollable.off('scrollToTop', this, this.handleScrollToTop);
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
     * Setup the perfect scrollbar instance on render
     * @param {HTMLElement} element
     */
    @action
    onElementInsert(element: HTMLElement) {
        this.scrollElement = element;
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        Scrollable: typeof Scrollable;
    }
}
