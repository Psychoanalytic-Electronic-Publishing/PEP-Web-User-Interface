import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import ModalService from '@gavant/ember-modals/services/modal';

import DrawerService from 'pep/services/drawer';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import Session from 'pep/services/pep-session';

interface PageDrawerArgs {
    openAboutModal: () => Promise<void>;
}

export default class PageDrawer extends Component<PageDrawerArgs> {
    @service drawer!: DrawerService;
    @service('pep-session') session!: Session;
    @service auth!: AuthService;
    @service modal!: ModalService;
    @service configuration!: ConfigurationService;

    @tracked isUserMenuOpen = false;

    get defaultSearchParams() {
        return this.configuration.defaultSearchParams;
    }

    /**
     * Closes the page drawer nav
     */
    @action
    closeDrawer() {
        return this.drawer.toggle(false);
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
}
