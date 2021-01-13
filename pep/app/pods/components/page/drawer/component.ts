import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import ModalService from '@gavant/ember-modals/services/modal';

import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import DrawerService from 'pep/services/drawer';
import PepSessionService from 'pep/services/pep-session';
import { SUPPORT_URL } from 'pep/constants/urls';

interface PageDrawerArgs {
    openAboutModal: () => Promise<void>;
}

export default class PageDrawer extends Component<PageDrawerArgs> {
    @service drawer!: DrawerService;
    @service('pep-session') session!: PepSessionService;
    @service auth!: AuthService;
    @service modal!: ModalService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;

    @tracked isUserMenuOpen = false;
    @tracked isHelpMenuOpen = false;

    supportUrl = SUPPORT_URL;

    get defaultSearchParams() {
        return this.configuration.defaultSearchParams;
    }

    get readDisabled() {
        return !!!this.currentUser.lastViewedDocumentId;
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

    /**
     *  Open the account info modal.
     */
    @action
    openAccountInfoModal() {
        return this.modal.open('user/info', {});
    }

    /**
     * Open Help modal
     *
     * @return {*}
     * @memberof PageDrawer
     */
    @action
    openHelpModal() {
        return this.modal.open('help/preferences', {});
    }

    /**
     * Open Report Data Error Modal
     *
     * @returns {void}
     */
    @action
    openReportDataErrorModal() {
        return this.modal.open('help/report-data-error', {});
    }

    /**
     * Open Feedback Modal
     *
     * @returns {void}
     */
    @action
    openFeedbackModal() {
        return this.modal.open('help/feedback', {});
    }
}
