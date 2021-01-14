import { TransitionArgs } from 'ember-animated';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';

export function* fadeTransition({ keptSprites, removedSprites, insertedSprites }: TransitionArgs) {
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
