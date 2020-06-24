import Component from '@glimmer/component';
import move from 'ember-animated/motions/move';

interface SearchRefineApplyArgs {}

export default class SearchRefineApply extends Component<SearchRefineApplyArgs> {
    *animateTransition({ keptSprites, removedSprites, insertedSprites }) {
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
