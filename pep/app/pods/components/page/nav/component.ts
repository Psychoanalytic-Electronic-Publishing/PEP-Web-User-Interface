import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ModalService from '@gavant/ember-modals/services/modal';

import AuthService from 'pep/services/auth';
import DrawerService from 'pep/services/drawer';
import { SEARCH_DEFAULT_PARAMS } from 'pep/constants/search';
import Session from 'pep/services/pep-session';

interface PageNavArgs {
    openAboutModal: () => Promise<void>;
}

export default class PageNav extends Component<PageNavArgs> {
    @service modal!: ModalService;
    @service('pep-session') session!: Session;
    @service auth!: AuthService;
    @service drawer!: DrawerService;

    defaultSearchParams = SEARCH_DEFAULT_PARAMS;

    /**
     * Opens the user preferences modal dialog
     */
    @action
    openPreferencesModal() {
        return this.modal.open('user/preferences', {});
    }

    /**
     * Opens the login modal dialog
     */
    @action
    openLoginModal() {
        return this.auth.openLoginModal(true);
    }

    /**
     * Logs the user out
     */
    @action
    logout() {
        return this.session.invalidate();
    }

    /**
     * Toggle page drawer nav
     */
    @action
    toggleDrawer() {
        return this.drawer.toggle();
    }
}
