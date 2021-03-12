import { action } from '@ember/object';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { later, next } from '@ember/runloop';
import { inject as service } from '@ember/service';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import NotificationService from 'ember-cli-notifications/services/notifications';
import CookiesService from 'ember-cookies/services/cookies';
import IntlService from 'ember-intl/services/intl';
import MetricService from 'ember-metrics/services/metrics';
import MediaService from 'ember-responsive/services/media';
import TourService, { Step, StepButton } from 'ember-shepherd/services/tour';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

import { PepSecureAuthenticatedData } from 'pep/api';
import { PreferenceKey } from 'pep/constants/preferences';
import { DesktopTour, MobileTour } from 'pep/constants/tour';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import PageLayout from 'pep/mixins/page-layout';
import { ApiServerErrorResponse } from 'pep/pods/application/adapter';
import ApplicationController from 'pep/pods/application/controller';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import DrawerService from 'pep/services/drawer';
import LangService from 'pep/services/lang';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import SidebarService from 'pep/services/sidebar';
import ThemeService from 'pep/services/theme';
import { onAuthenticated } from 'pep/utils/user';

export default class Application extends PageLayout(Route.extend(ApplicationRouteMixin)) {
    routeAfterAuthentication = 'index';

    @service router!: RouterService;
    @service metrics!: MetricService;
    @service('pep-session') session!: PepSessionService;
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
    @service tour!: TourService;
    @service cookies!: CookiesService;
    @service drawer!: DrawerService;

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
                this.cookies.write('pep_session_fastboot', this.cookies.read('pep_session'), {});
            } catch (errors) {
                this.session.invalidate();
            }
        } else if (this.cookies.exists('pep_session_fastboot')) {
            // If the fastboot session cookie exists, it means we have new information. So rewrite the pep_session we were logged in with
            // and pass this new session to the user endpoint to make sure we get the correct one. We can't just rely on having the right ID
            // as the update from cookie to session service happens asynchronously
            const newSession = this.cookies.read('pep_session_fastboot');
            this.cookies.write('pep_session', newSession, {});
            const sessionData: { authenticated: PepSecureAuthenticatedData } = JSON.parse(newSession);
            sessionId = sessionData.authenticated.SessionId;
            this.cookies.clear('pep_session_fastboot', {});
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
     * Handler called by ember-simple-auth upon successful login
     */
    async sessionAuthenticated(): Promise<void> {
        onAuthenticated(this);

        // trigger a custom event on the session that tells us when the user is logged in
        // and all other post-login tasks (loading user record, prefs/configs setup, etc) is complete
        // as the built-in `authenticationSucceeded` event fires immediately after the login request returns
        this.session.trigger('authenticationAndSetupSucceeded');

        // dont redirect the user on login if the behavior is suppressed
        if (this.auth.dontRedirectOnLogin) {
            this.auth.dontRedirectOnLogin = false;
        } else {
            //@ts-ignore TODO we need a way to inform TS about class members coming from Ember-style mixins
            super.sessionAuthenticated(...arguments);
        }
    }

    /**
     * Sets up the tour by providing options and steps to ember-shepherd
     *
     * @memberof Application
     */
    async setupTour(): Promise<void> {
        const sizeClass = this.media.isMobile ? 'mobile-tour' : 'desktop-tour';
        this.tour.set('defaultStepOptions', {
            classes: `${sizeClass} ${this.theme.currentTheme.id}`,
            cancelIcon: {
                enabled: true
            },
            scrollTo: true,
            popperOptions: {
                modifiers: [{ name: 'offset', options: { offset: [0, 10] } }]
            },
            when: {
                cancel: () => {
                    this.currentUser.updatePrefs({ [PreferenceKey.TOUR_ENABLED]: false });
                }
            }
        });
        this.tour.set('disableScroll', true);
        this.tour.set('modal', true);
        this.tour.set('exitOnEsc', true);
        this.tour.set('keyboardNavigation', true);

        const partialSteps = this.media.isMobile ? MobileTour : DesktopTour;
        const steps: Step[] = partialSteps.map((partialStep, index) => {
            const tour = this.configuration.content.global.tour;
            const id = partialStep.id;
            const buttons: StepButton[] =
                partialStep.buttons?.map((button) => {
                    return {
                        ...button,
                        text:
                            index !== partialSteps.length - 1
                                ? this.intl.t('tour.leftSidebar.buttons.next')
                                : this.intl.t('tour.rightSidebar.buttons.cancel')
                    };
                }) ?? [];
            const step: Step = {
                ...partialStep,
                text: tour[id].text,
                title: tour[id].title,
                buttons
            };
            if (partialStep.beforeShow) {
                step.beforeShowPromise = () => {
                    return new Promise((resolve) => {
                        partialStep.beforeShow?.(this);
                        later(resolve, 1000);
                    });
                };
            }
            return step;
        });
        steps[steps.length - 1].when = {
            show: () => {
                this.currentUser.updatePrefs({ [PreferenceKey.TOUR_ENABLED]: false });
            }
        };

        await this.tour.addSteps(steps);
        this.tour.start();
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
        if (this.currentUser.preferences?.tourEnabled) {
            this.setupTour();
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
