import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import MediaService from 'ember-responsive/services/media';

import SidebarService from 'pep/services/sidebar';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarMaskArgs {}

export default class PageSidebarMask extends Component<BaseGlimmerSignature<PageSidebarMaskArgs>> {
    @service sidebar!: SidebarService;
    @service media!: MediaService;

    /**
     * Closes all open sidebars when the mask is clicked
     */
    @action
    closeSidebars() {
        this.sidebar.toggleAll(false);
    }
}
