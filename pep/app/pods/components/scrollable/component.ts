import Component from '@glimmer/component';
import { action } from '@ember/object';
import PerfectScrollbar from 'perfect-scrollbar';

interface ScrollableArgs {}

export default class Scrollable extends Component<ScrollableArgs> {
    @action
    initScrollable(element) {
        const ps = new PerfectScrollbar(element, {
            //@see https://github.com/mdbootstrap/perfect-scrollbar#options
            wheelSpeed: 1
        });

        this.ps = ps;
    }
}
