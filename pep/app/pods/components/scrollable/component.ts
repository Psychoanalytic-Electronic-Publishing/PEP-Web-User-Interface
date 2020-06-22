import Component from '@glimmer/component';
import { action } from '@ember/object';
import PerfectScrollbar from 'perfect-scrollbar';
import { inject as service } from '@ember/service';

interface ScrollableArgs {
    //TODO
}

export default class Scrollable extends Component<ScrollableArgs> {
    @service media;

    ps = null;
    scrollElement = null;

    constructor(owner, args) {
        super(owner, args);
        this.handleMediaChange();
        this.media.on('mediaChanged', this, this.handleMediaChange);
    }

    setup(element) {
        if (element && !this.ps) {
            const ps = new PerfectScrollbar(element, {
                //@see https://github.com/mdbootstrap/perfect-scrollbar#options
                wheelSpeed: 1
            });

            this.ps = ps;
            this.scrollElement = element;
        }
    }

    teardown() {
        if (this.ps) {
            this.ps.destroy();
            this.ps = null;
        }
    }

    handleMediaChange() {
        //disable perfect-scrollbar in mobile as it doesnt support momentum scrolling
        if (this.media.isMobile || this.media.isTablet) {
            this.teardown();
        } else {
            this.setup(this.scrollElement);
        }
    }

    @action
    onElementInsert(element) {
        if (!this.media.isMobile && !this.media.isTablet) {
            this.setup(element);
        }

        if (this.args.onInsert) {
            this.args.onInsert(element);
        }
    }
}
