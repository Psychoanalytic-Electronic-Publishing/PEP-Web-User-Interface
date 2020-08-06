import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';
import { TransitionArgs } from 'ember-animated';

import ScrollableService from 'pep/services/scrollable';

interface AlertArgs {
    isShown: boolean;
    type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    message?: string;
    icon?: string;
    scrollableNamespace?: string;
    animateInitialInsert?: boolean;
}

export default class Alert extends Component<AlertArgs> {
    @service scrollable!: ScrollableService;

    animateDuration = 300;

    get animateInitialInsert() {
        return this.args.animateInitialInsert ?? true;
    }

    /**
     * ember-animated transition to show/hide alert
     * @param {TransitionArgs}
     */
    *animateTransition({ keptSprites, removedSprites, insertedSprites }: TransitionArgs) {
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
     * Recalculates the alert's parent <Scrollable>'s scroll height on show/hide
     * if a scrollable namespace is provided
     */
    @action
    onIsShownUpdate() {
        if (this.args.scrollableNamespace) {
            later(() => this.scrollable.recalculate(this.args.scrollableNamespace), this.animateDuration);
        }
    }
}
