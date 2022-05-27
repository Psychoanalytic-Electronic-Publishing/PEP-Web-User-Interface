import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import DrawerService from 'pep/services/drawer';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageDrawerNavItemArgs {}

export default class PageDrawerNavItem extends Component<BaseGlimmerSignature<PageDrawerNavItemArgs>> {
    @service drawer!: DrawerService;

    /**
     * Closes the page drawer nav on click
     */
    @action
    closeDrawer() {
        return this.drawer.toggle(false);
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Page::Drawer::NavItem': typeof PageDrawerNavItem;
    }
}
