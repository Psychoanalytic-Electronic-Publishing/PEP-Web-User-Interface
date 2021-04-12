import { action } from '@ember/object';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import NotificationService from 'ember-cli-notifications/services/notifications';
import CookiesService from 'ember-cookies/services/cookies';
import MetricService from 'ember-metrics/services/metrics';
import MediaService from 'ember-responsive/services/media';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

import ModalService from '@gavant/ember-modals/services/modal';

import { PepSecureAuthenticatedData } from 'pep/api';
import {
    FASTBOOT_SESSION_WORKAROUND_COOKIE_NAME, HIDE_TOUR_COOKIE_NAME, SESSION_COOKIE_NAME
} from 'pep/constants/cookies';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import PageLayout from 'pep/mixins/page-layout';
import { ApiServerErrorResponse } from 'pep/pods/application/adapter';
import ApplicationController from 'pep/pods/application/controller';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import DrawerService from 'pep/services/drawer';
import IntroTour from 'pep/services/intro-tour';
import LangService from 'pep/services/lang';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import SidebarService from 'pep/services/sidebar';
import ThemeService from 'pep/services/theme';

/**
 * Unforunately we need to keep the application route mixin for a little while longer
 * @see https://discord.com/channels/480462759797063690/496695347582861334/828696746678026260
 * @export
 * @class Application
 * @extends {PageLayout(Route.extend(ApplicationRouteMixin))}
 */
export default class Application extends PageLayout(Route.extend(ApplicationRouteMixin)) {
    routeAfterAuthentication = 'index';

    @service router!: RouterService;
    @service metrics!: MetricService;
    @service('pep-session') session!: PepSessionService;
    @service fastboot!: FastbootService;
    @service media!: MediaService;
    @service notifications!: NotificationService;
    @service auth!: AuthService;
    @service currentUser!: CurrentUserService;
    @service configuration!: ConfigurationService;
    @service theme!: ThemeService;
    @service lang!: LangService;
    @service loadingBar!: LoadingBarService;
    @service sidebar!: SidebarService;
    @service cookies!: CookiesService;
    @service drawer!: DrawerService;
    @service introTour!: IntroTour;
    @service modal!: ModalService;

    constructor() {
        super(...arguments);

        const router = this.router;
        router.on('routeDidChange', () => {
            const page = router.currentURL;
            const title = router.currentRouteName || 'unknown';

            this.metrics.trackPage({ page, title });
        });
    }

    /**
     * App setup and configuration tasks
     * Runs on initial app boot, and also after the user logs in
     * So that any user session-specific preferences are applied
     * @return {*}  {Promise<void>}
     * @memberof Application
     */
    async appSetup(): Promise<void> {
        this.currentUser.setup();
        this.currentUser.setFontSize(this.currentUser.fontSize.id);
        await this.theme.setup();
        await this.lang.setup();
        return this.configuration.setup();
    }

    /**
     * App bootup initialization tasks, set locale/theme, etc
     * If the user is already authenticated, load their data here
     * @param {Transition} transition
     */
    async beforeModel(transition: Transition): Promise<void> {
        super.beforeModel(transition);
        let sessionId;
        if (this.fastboot.isFastBoot) {
            this.auth.dontRedirectOnLogin = true;
        }
        // IP auth should only happen if we are in fastboot, and we are not authenticated OR we are given a session ID in the url
        if (
            this.fastboot.isFastBoot &&
            (!this.session.isAuthenticated || this.fastboot.request.queryParams.sessionId)
        ) {
            try {
                await this.session.authenticate('authenticator:ip');

                // We are doing this to work around a strange cookie issue seen from what we think is Ember Simple Auth.
                // The fastboot session would authenticate through IP, we would write to the cookie and save everything but when the app
                // loaded back up, we would be logged out and the cookie would mysteriously be removed. We work around this by writing the our own cookie
                // and then getting that cookie and setting it as the simple auth cookie to force auth state.
                this.cookies.write(FASTBOOT_SESSION_WORKAROUND_COOKIE_NAME, this.cookies.read(SESSION_COOKIE_NAME), {});
            } catch (errors) {
                this.session.invalidate();
            }
        } else if (this.cookies.exists(FASTBOOT_SESSION_WORKAROUND_COOKIE_NAME)) {
            // If the fastboot session cookie exists, it means we have new information. So rewrite the pep_session we were logged in with
            // and pass this new session to the user endpoint to make sure we get the correct one. We can't just rely on having the right ID
            // as the update from cookie to session service happens asynchronously
            const newSession = this.cookies.read(FASTBOOT_SESSION_WORKAROUND_COOKIE_NAME);
            this.cookies.write(SESSION_COOKIE_NAME, newSession, {});
            const sessionData: { authenticated: PepSecureAuthenticatedData } = JSON.parse(newSession);
            sessionId = sessionData.authenticated.SessionId;
            this.cookies.clear(FASTBOOT_SESSION_WORKAROUND_COOKIE_NAME, {});
        }

        try {
            if (this.session.isAuthenticated) {
                await this.currentUser.load(sessionId);
            }
        } catch (err) {
            this.replaceWith('five-hundred');
        }
        return this.appSetup();
    }

    /**
     * If the tour is enabled, show it
     *
     * @param {ApplicationController} controller
     * @param {*} model
     * @memberof Application
     */
    @dontRunInFastboot
    async setupController(controller: ApplicationController, model: any, transition: Transition): Promise<void> {
        super.setupController(controller, model, transition);
        const hideTour = this.cookies.read(HIDE_TOUR_COOKIE_NAME);
        if (this.currentUser.preferences?.tourEnabled && !hideTour) {
            this.introTour.show();
        }
        if (controller.openNotificationModal === true) {
            this.modal.open('whats-new/subscription', {});
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
    loading(transition: Transition): boolean {
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
    didTransition(): void {
        if (this.media.isMobile || this.media.isTablet) {
            this.sidebar.toggleAll(false);
        }
    }

    sessionAuthenticated(routeAfterAuth: string) {
        // dont redirect the user on login if the behavior is suppressed
        if (this.auth.dontRedirectOnLogin) {
            this.auth.dontRedirectOnLogin = false;
            this.session.handleAuthentication(routeAfterAuth);
        } else {
            //@ts-ignore mixin - bleh
            super.sessionAuthenticated(...arguments);
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
    error(error?: ApiServerErrorResponse): boolean {
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
