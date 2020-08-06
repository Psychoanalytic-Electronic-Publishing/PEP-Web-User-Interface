import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import { TransitionArgs } from 'ember-animated';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';

import ScrollableService from 'pep/services/scrollable';

export interface CollapsiblePanelArgs {
    isOpen: boolean;
    title: string;
    scrollableNamespace?: string;
    toggle: (isOpen: boolean) => void;
}

export default class CollapsiblePanel extends Component<CollapsiblePanelArgs> {
    @service scrollable!: ScrollableService;

    animateDuration = 300;

    /**
     * ember-animated transition for panel collapse/expand
     * @param {TransitionArgs}
     */
    *transition({ keptSprites, removedSprites, insertedSprites }: TransitionArgs) {
        for (let sprite of keptSprites) {
            move(sprite);
        }

        for (let sprite of removedSprites) {
            fadeOut(sprite);
        }

        for (let sprite of insertedSprites) {
            fadeIn(sprite);
        }
    }

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
