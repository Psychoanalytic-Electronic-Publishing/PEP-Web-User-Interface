import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import MediaService from 'ember-responsive/services/media';
import Sidebar from 'pep/services/sidebar';

interface PageSidebarMaskArgs {}

export default class PageSidebarMask extends Component<PageSidebarMaskArgs> {
    @service sidebar!: Sidebar;
    @service media!: MediaService;

    /**
     * Closes all open sidebars when the mask is clicked
     */
    @action
    closeSidebars() {
        this.sidebar.toggleAll(false);
    }
}
