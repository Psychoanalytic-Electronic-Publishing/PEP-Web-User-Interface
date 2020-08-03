import Component from '@glimmer/component';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';
import { TransitionArgs } from 'ember-animated';

interface AlertArgs {
    isShown: boolean;
    type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    message?: string;
    icon?: string;
    animateInitialInsert?: boolean;
}

export default class Alert extends Component<AlertArgs> {
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
}
