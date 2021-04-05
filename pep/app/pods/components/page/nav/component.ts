import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import NotificationService from 'ember-cli-notifications/services/notifications';

import ModalService from '@gavant/ember-modals/services/modal';

import {
    LOGOUT, NAVIGATE_TO_READ, OPEN_LOGIN, OPEN_USER_MENU, OPEN_USER_PREFERENCES, SECRET_DAVE_CODE
} from 'pep/constants/keyboard-shortcuts';
import { Languages } from 'pep/constants/lang';
import { PEP_FACEBOOK_URL, SUPPORT_URL } from 'pep/constants/urls';
import { KeyboardShortcut } from 'pep/modifiers/register-keyboard-shortcuts';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService, { VIEW_DOCUMENT_FROM } from 'pep/services/current-user';
import DrawerService from 'pep/services/drawer';
import PepSessionService from 'pep/services/pep-session';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageNavArgs {
    openAboutModal: () => Promise<void>;
}

export default class PageNav extends Component<BaseGlimmerSignature<PageNavArgs>> {
    @service modal!: ModalService;
    @service('pep-session') session!: PepSessionService;
    @service auth!: AuthService;
    @service drawer!: DrawerService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;
    @service router!: RouterService;
    @service notifications!: NotificationService;

    @tracked logoNavigationGoesHome = false;

    @tracked shortcuts: KeyboardShortcut[] = [
        {
            keys: SECRET_DAVE_CODE,
            shortcut: () => {
                this.notifications.success('Dave mode entered');
                this.logoNavigationGoesHome = true;
            }
        },
        {
            keys: NAVIGATE_TO_READ,
            shortcut: this.viewRead
        },
        {
            keys: OPEN_USER_MENU,
            shortcut: this.openAccountInfoModal
        },
        {
            keys: OPEN_USER_PREFERENCES,
            shortcut: this.openPreferencesModal
        },
        {
            keys: OPEN_LOGIN,
            shortcut: this.openLoginModal
        },
        {
            keys: LOGOUT,
            shortcut: this.logout
        }
    ];

    supportUrl = SUPPORT_URL;
    facebookUrl = PEP_FACEBOOK_URL;

    languages = Languages;

    get readDisabled() {
        return !this.currentUser.lastViewedDocument?.id;
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
    openPreferencesModal(): void | undefined {
        return this.modal.open('user/preferences', {});
    }

    /**
     * Opens the login modal dialog
     */
    @action
    openLoginModal(): Promise<void> | undefined {
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
        if (this.session.isAuthenticated) {
            return this.modal.open('user/info', {});
        }
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
        if (this.currentUser.lastViewedDocument?.id) {
            if (this.currentUser.lastViewedDocument.from === VIEW_DOCUMENT_FROM.SEARCH) {
                this.router.transitionTo('search.read', this.currentUser.lastViewedDocument.id);
            } else {
                this.router.transitionTo('browse.read', this.currentUser.lastViewedDocument.id);
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
}
