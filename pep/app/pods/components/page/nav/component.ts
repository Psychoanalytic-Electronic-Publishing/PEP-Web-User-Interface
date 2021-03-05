import { Languages } from 'pep/constants/lang';
import { SUPPORT_URL } from 'pep/constants/urls';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService, { VIEW_DOCUMENT_FROM } from 'pep/services/current-user';
import DrawerService from 'pep/services/drawer';
import PepSessionService from 'pep/services/pep-session';

import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import ModalService from '@gavant/ember-modals/services/modal';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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
    @service router!: RouterService;

    supportUrl = SUPPORT_URL;

    languages = Languages;

    @tracked canLogOut!: boolean;

    get readDisabled() {
        return !this.currentUser.lastViewedDocumentId;
    }

    get readActive() {
        return this.router.currentRouteName?.includes('read');
    }

    get browseActive() {
        return this.router.currentRouteName?.includes('browse') && !this.readActive;
    }

    get searchActive() {
        return this.router.currentRouteName?.includes('search') && !this.readActive;
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

    /**
     * Open Help Modal
     *
     * @return {*}
     * @memberof PageNav
     */
    @action
    openHelpModal() {
        return this.modal.open('help/preferences', {});
    }

    /**
     *  View last read document
     *
     * @memberof PageNav
     */
    @action
    viewRead() {
        if (this.currentUser.lastViewedDocumentId) {
            if (this.currentUser.lastViewedDocumentFrom === VIEW_DOCUMENT_FROM.SEARCH) {
                this.router.transitionTo('search.read', this.currentUser.lastViewedDocumentId);
            } else {
                this.router.transitionTo('browse.read', this.currentUser.lastViewedDocumentId);
            }
        }
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

    /**
     * Set any necessary tracked properties when
     * a dropdown is opened.
     *
     * NOTE: This is necessary because accessing `this.sessions.canLogOut`
     * directly has been problematic in this component. It works fine in
     * other locations but doesn't cause re-rendering here unexplainably.
     * These problems occurred specifically when logging in after a preference
     * was updated.
     *
     */
    @action
    setProperties() {
        this.canLogOut = this.session.canLogOut;
    }
}
