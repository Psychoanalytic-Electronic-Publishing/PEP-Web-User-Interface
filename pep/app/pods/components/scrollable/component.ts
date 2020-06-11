import Component from '@glimmer/component';
import { action } from '@ember/object';

interface ScrollableArgs {}

export default class Scrollable extends Component<ScrollableArgs> {
    @action
    initScrollable() {
        console.log('insert!');
    }
}
