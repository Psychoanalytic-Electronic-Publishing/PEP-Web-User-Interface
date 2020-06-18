import Component from '@glimmer/component';
import { action } from '@ember/object';
import move from 'ember-animated/motions/move';
import { fadeIn, fadeOut } from 'ember-animated/motions/opacity';

interface CollapsiblePanelArgs {
    isOpen: boolean;
    title: string;
    toggle: (isOpen: boolean) => void;
}

export default class CollapsiblePanel extends Component<CollapsiblePanelArgs> {
    *transition({ keptSprites, removedSprites, insertedSprites }) {
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

    @action
    toggle(event) {
        event.preventDefault();
        return this.args.toggle(!this.args.isOpen);
    }
}
