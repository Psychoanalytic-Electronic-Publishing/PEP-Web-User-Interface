import { action } from '@ember/object';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';
import MetricService from 'ember-metrics/services/metrics';
import MediaService from 'ember-responsive/services/media';
import TourService from 'ember-shepherd/services/tour';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';

import PageLayout from 'pep/mixins/page-layout';
import { ApiServerErrorResponse } from 'pep/pods/application/adapter';
import AuthService from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import LangService from 'pep/services/lang';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import SidebarService from 'pep/services/sidebar';
import ThemeService from 'pep/services/theme';

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

    constructor() {
        super(...arguments);

        let router = this.router;
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
     * @returns {Promise<void>}
     */
    async appSetup() {
        this.currentUser.setup();
        await this.theme.setup();
        await this.lang.setup();
        return this.configuration.setup();
    }

    /**
     * App bootup initialization tasks, set locale/theme, etc
     * If the user is already authenticated, load their data here
     * @param {Transition} transition
     */
    async beforeModel(transition: Transition) {
        super.beforeModel(transition);

        // IP authentication should only happen once, IN fastboot
        // if the user doesn't get logged in, a second call on
        // client-side boot would be pointless, and would add a
        // delay (and as a result, FOUC) to the app setup process
        // since we do not currently cache ajax service requests
        // in the fastboot shoebox (like ember-data does)

        if (this.fastboot.isFastBoot && !this.session.isAuthenticated) {
            try {
                await this.session.authenticate('authenticator:ip');
            } catch (errors) {
                this.session.invalidate();
            }
        }

        if (this.fastboot.isFastBoot) {
            this.auth.dontRedirectOnLogin = true;
        }

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
            // get the current user's model before transitioning from the login page
            await this.currentUser.load();
        } catch (err) {
            this.notifications.error(this.intl.t('login.error'));
            throw err;
        }

        // update configurations based on the newly logged in user session
        await this.appSetup();

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

    async setupController(controller, model) {
        super.setupController(controller, model);
        this.tour.set('defaultStepOptions', {
            cancelIcon: {
                enabled: false
            },
            classes: 'class-1 class-2',
            scrollTo: true
        });
        this.tour.set('disableScroll', true);
        this.tour.set('modal', true);

        await this.tour.addSteps([
            {
                id: 'home',
                attachTo: {
                    element: '.nav-item.home',
                    on: 'bottom'
                },
                text: 'This button takes you home',
                title: 'Home',
                buttons: [
                    {
                        text: 'Next',
                        type: 'next'
                    }
                ]
            },
            {
                id: 'toggle-left',
                attachTo: {
                    element: '.sidebar-left .sidebar-toggle-handle',
                    on: 'left'
                },
                classes: 'tour-left-sidebar-spacing',
                text: 'This toggles the sidebar open or closed',
                title: 'Left Sidebar Toggle',
                buttons: [
                    {
                        text: 'Next',
                        type: 'next'
                    }
                ],
                scrollTo: true
            },
            {
                id: 'toggle-right',
                attachTo: {
                    element: '.sidebar-right .sidebar-toggle-handle',
                    on: 'left'
                },
                classes: 'tour-right-sidebar-spacing',
                text: 'This toggles the sidebar open or closed',
                title: 'Right Sidebar Toggle',
                buttons: [
                    {
                        text: 'Close',
                        type: 'next'
                    }
                ]
            }
        ]);
        this.tour.start();
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
