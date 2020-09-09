import { action } from '@ember/object';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import MediaService from 'ember-responsive/services/media';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import PageLayout from 'pep/mixins/page-layout';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import SidebarService from 'pep/services/sidebar';
import ThemeService from 'pep/services/theme';
import AuthService from 'pep/services/auth';
import LangService from 'pep/services/lang';
import ConfigurationService from 'pep/services/configuration';
import { ApiServerErrorResponse } from 'pep/pods/application/adapter';
import Session from 'pep/services/pep-session';

export default class Application extends PageLayout(Route.extend(ApplicationRouteMixin)) {
    routeAfterAuthentication = 'index';

    @service('pep-session') session!: Session;
    @service fastboot!: FastbootService;
    @service media!: MediaService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;

    @service auth!: AuthService;
    @service currentUser!: CurrentUserService;
    @service configuration!: ConfigurationService;
    @service theme!: ThemeService;
    @service lang!: LangService;
    @service loadingBar!: LoadingBarService;
    @service sidebar!: SidebarService;

    /**
     * App setup and configuration tasks
     * Runs on initial app boot, and also after the user logs in
     * So that any user session-specific preferences are applied
     * @returns {Promise<void>}
     */
    appSetup() {
        this.theme.setup();
        this.lang.setup();
        return this.configuration.setup();
    }

    /**
     * App bootup initialization tasks, set locale/theme, etc
     * If the user is already authenticated, load their data here
     * @param {Transition} transition
     */
    async beforeModel(transition: Transition) {
        super.beforeModel(transition);

        try {
            if (this.session.isAuthenticated) {
                await this.currentUser.load();
            }
        } catch (err) {
            this.replaceWith('five-hundred');
        } finally {
            return this.appSetup();
        }
    }

    /**
     * Handler called by ember-simple-auth upon successful login
     */
    async sessionAuthenticated() {
        try {
            //get the current user's model before transitioning from the login page
            await this.currentUser.load();
        } catch (err) {
            this.notifications.error(this.intl.t('login.error'));
            this.session.invalidate();
            throw err;
        }

        //update configurations based on the newly logged in user session
        await this.appSetup();

        //dont redirect the user on login if the behavior is suppressed
        if (this.auth.dontRedirectOnLogin) {
            this.auth.dontRedirectOnLogin = false;
        } else {
            //@ts-ignore TODO we need a way to inform TS about class members coming from Ember-style mixins
            super.sessionAuthenticated(...arguments);
        }
    }

    /**
     * Invoked when transitioning to routes that do not immediately resolve
     *
     * Show the app loading progress bar to indicate that the app is in a
     * loading state when transitioning between routes
     * @param {Object} transition
     */
    @action
    loading(transition: Transition) {
        this.loadingBar.show();
        //@ts-ignore - `promise` appears to technically be a private api
        transition.promise.finally(() => this.loadingBar.hide());
        //allows loading routes to be shown if needed
        return true;
    }

    /**
     * When transitioning to a new route, close sidebars on mobile/tablet
     */
    @action
    didTransition() {
        if (this.media.isMobile || this.media.isTablet) {
            this.sidebar.toggleAll(false);
        }
    }

    /**
     * Top level route error event handler - If routes reject with an error
     * i.e. do not explicitly catch and handle errors return by their
     * model()/beforeModel()/afterModel() hooks, this will be invoked.
     * Which will redirect the user as needed, depending the type of error returned
     * @param {ApiServerErrorResponse} error
     */
    @action
    error(error?: ApiServerErrorResponse) {
        if (this.fastboot.isFastBoot) {
            this.fastboot.response.statusCode = error?.errors?.[0]?.status ?? 200;
        }
        if (error?.errors?.length && error?.errors?.length > 0) {
            const status = error?.errors?.[0].status;
            if (status === '403') {
                this.replaceWith('four-oh-three');
                //marks error as being handled
                return false;
            } else if (status === '401') {
                this.replaceWith('login');
                //marks error as being handled
                return false;
            } else if (status === '404') {
                this.replaceWith('four-oh-four', '404');
                //marks error as being handled
                return false;
            }
        }
        return true;
    }
}
