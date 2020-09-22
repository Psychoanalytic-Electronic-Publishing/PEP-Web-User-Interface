import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import SidebarService from 'pep/services/sidebar';
import FastbootMediaService from 'pep/services/fastboot-media';
import ConfigurationService from 'pep/services/configuration';
import AuthService from 'pep/services/auth';
import PepSessionService from 'pep/services/pep-session';

export default class Index extends Controller {
    @service sidebar!: SidebarService;
    @service fastbootMedia!: FastbootMediaService;
    @service configuration!: ConfigurationService;
    @service auth!: AuthService;
    @service('pep-session') session!: PepSessionService;

    get intro() {
        return this.configuration.content.home.intro;
    }

    get expertPick() {
        const expertPicks = this.configuration.base.home.expertPicks;
        return expertPicks[expertPicks.length - 1];
    }

    /**
     * Open the search form sidebar
     * @returns {void}
     */
    @action
    showSearch() {
        return this.sidebar.toggleLeftSidebar(true);
    }

    /**
     * Opens login modal (if user is not logged in already)
     * and then transitions to the document read page
     * @returns {void | Promise<void>}
     */
    @action
    readExpertPick() {
        if (!this.session.isAuthenticated) {
            return this.auth.openLoginModal(true, {
                actions: {
                    onAuthenticated: this.transitionToExpertPick
                }
            });
        } else {
            return this.transitionToExpertPick();
        }
    }

    /**
     * Load the expert pick article once the user is logged in
     * @returns {Promise<void>}
     */
    @action
    async transitionToExpertPick() {
        return this.transitionToRoute('read.document', this.expertPick.articleId);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        index: Index;
    }
}
