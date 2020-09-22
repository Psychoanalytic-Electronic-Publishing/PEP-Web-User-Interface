import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

import ScrollableService from 'pep/services/scrollable';
import { fadeTransition } from 'pep/utils/animation';

export interface CollapsiblePanelArgs {
    isOpen: boolean;
    scrollableNamespace?: string;
    toggle: (isOpen: boolean) => void;
}

export default class CollapsiblePanel extends Component<CollapsiblePanelArgs> {
    @service scrollable!: ScrollableService;

    animateDuration = 300;
    animateTransition = fadeTransition;

    /**
     * Toggles the collapsed/expanded state of the panel
     * @param {Event} event
     */
    @action
    toggle(event: Event) {
        event.preventDefault();
        this.args.toggle(!this.args.isOpen);
        if (this.args.scrollableNamespace) {
            later(() => this.scrollable.recalculate(this.args.scrollableNamespace), this.animateDuration);
        }
    }
}
