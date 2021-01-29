/* eslint-disable require-yield */
import { TransitionArgs } from 'ember-animated';
import { easeIn, easeOut } from 'ember-animated/easings/cosine';
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

export function* slideDown({ keptSprites, removedSprites, insertedSprites }: TransitionArgs) {
    for (let sprite of insertedSprites) {
        sprite.startAtPixel({ y: -window.innerHeight });
        // @ts-ignore
        move(sprite, { easing: easeOut });
    }

    for (let sprite of keptSprites) {
        move(sprite);
    }

    for (let sprite of removedSprites) {
        sprite.endAtPixel({ y: -window.innerHeight });
        // @ts-ignore
        move(sprite, { easing: easeIn });
    }
}
