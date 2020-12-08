import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import ModalService from '@gavant/ember-modals/services/modal';

import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import DrawerService from 'pep/services/drawer';
import PepSessionService from 'pep/services/pep-session';

interface PageNavArgs {
    openAboutModal: () => Promise<void>;
}

export default class PageNav extends Component<PageNavArgs> {
    @service modal!: ModalService;
    @service('pep-session') session!: PepSessionService;
    @service auth!: AuthService;
    @service drawer!: DrawerService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;

    get readDisabled() {
        return !this.currentUser.lastViewedDocumentId;
    }

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

    /**
     *  Open the account info modal.
     */
    @action
    openAccountInfoModal() {
        return this.modal.open('user/info', {});
    }
}
