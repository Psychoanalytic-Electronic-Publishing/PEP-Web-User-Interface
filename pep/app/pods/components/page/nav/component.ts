import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import ModalService from '@gavant/ember-modals/services/modal';

import AuthService from 'pep/services/auth';
import DrawerService from 'pep/services/drawer';
import { SEARCH_DEFAULT_TERMS, SEARCH_DEFAULT_FACETS } from 'pep/constants/search';
import AjaxService from 'pep/services/ajax';
import ENV from 'pep/config/environment';
interface PageNavArgs {}

export interface ServerStatus {
    db_server_ok: boolean;
    text_server_ok: boolean;
    text_server_version: string;
    opas_version: string;
    dataSource: string;
    timeStamp: string;
    user_ip: string;
}

export default class PageNav extends Component<PageNavArgs> {
    @service modal!: ModalService;
    @service session!: SessionService;
    @service ajax!: AjaxService;
    @service auth!: AuthService;
    @service drawer!: DrawerService;

    //json stringify is workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    defaultSearchTerms = JSON.stringify(SEARCH_DEFAULT_TERMS);
    defaultSearchFacets = JSON.stringify(SEARCH_DEFAULT_FACETS);

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
     * Open the about modal dialog
     *
     * @returns Promise<Void>
     * @memberof PageDrawer
     */
    @action
    async openAboutModal() {
        try {
            const result = await this.ajax.request<ServerStatus>('Session/Status');
            return this.modal.open('user/about', {
                serverInformation: result,
                clientBuildVersion: ENV.buildVersion
            });
        } catch (error) {
            return error;
        }
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
