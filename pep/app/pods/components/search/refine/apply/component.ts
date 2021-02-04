import Component from '@glimmer/component';

import { TransitionArgs } from 'ember-animated';
import move from 'ember-animated/motions/move';

interface SearchRefineApplyArgs {
    hasChanges: boolean;
    apply: () => void;
}

export default class SearchRefineApply extends Component<SearchRefineApplyArgs> {
    /**
     * Transition for showing/hiding the apply bar
     * @param {TransitionArgs}
     */
    *animateTransition({ keptSprites, removedSprites, insertedSprites }: TransitionArgs): any {
        for (const sprite of keptSprites) {
            move(sprite);
        }

        for (const sprite of removedSprites) {
            sprite.endTranslatedBy(0, 60);
            move(sprite);
        }

        for (const sprite of insertedSprites) {
            sprite.startTranslatedBy(0, 60);
            move(sprite);
        }
    }
}
