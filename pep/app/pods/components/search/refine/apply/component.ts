import Component from '@glimmer/component';
import move from 'ember-animated/motions/move';
import { TransitionArgs } from 'ember-animated';

interface SearchRefineApplyArgs {
    hasChanges: boolean;
    apply: () => void;
}

export default class SearchRefineApply extends Component<SearchRefineApplyArgs> {
    /**
     * Transition for showing/hiding the apply bar
     * @param {TransitionArgs}
     */
    *animateTransition({ keptSprites, removedSprites, insertedSprites }: TransitionArgs) {
        for (let sprite of keptSprites) {
            move(sprite);
        }

        for (let sprite of removedSprites) {
            sprite.endTranslatedBy(0, 60);
            move(sprite);
        }

        for (let sprite of insertedSprites) {
            sprite.startTranslatedBy(0, 60);
            move(sprite);
        }
    }
}
