import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import DrawerService from 'pep/services/drawer';

interface PageDrawerNavItemArgs {}

export default class PageDrawerNavItem extends Component<PageDrawerNavItemArgs> {
    @service drawer!: DrawerService;

    /**
     * Closes the page drawer nav on click
     */
    @action
    closeDrawer() {
        return this.drawer.toggle(false);
    }
}
