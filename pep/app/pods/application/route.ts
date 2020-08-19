import { action } from '@ember/object';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import IntlService from 'ember-intl/services/intl';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import SessionService from 'ember-simple-auth/services/session';
import MediaService from 'ember-responsive/services/media';

import PageLayout from 'pep/mixins/page-layout';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import SidebarService from 'pep/services/sidebar';
import ThemeService from 'pep/services/theme';
import AuthService from 'pep/services/auth';
import { ApiServerErrorResponse } from 'pep/pods/application/adapter';

export default class Application extends PageLayout(Route.extend(ApplicationRouteMixin)) {
    routeAfterAuthentication = 'index';
    @service currentUser!: CurrentUserService;
    @service session!: SessionService;
    @service intl!: IntlService;
    @service fastboot!: FastbootService;
    @service loadingBar!: LoadingBarService;
    @service sidebar!: SidebarService;
    @service theme!: ThemeService;
    @service auth!: AuthService;
    @service media!: MediaService;

    /**
     * App bootup initialization tasks, set locale/theme, etc
     * If the user is already authenticated, load their data here
     * @param {Transition} transition
     */
    async beforeModel(transition: Transition) {
        super.beforeModel(transition);
        this.intl.setLocale('en-us');
        this.theme.setup();
        // if (this.session.isAuthenticated) {
        //     try {
        //         await this.currentUser.load();
        //     } catch (err) {
        //         this.replaceWith('five-hundred');
        //     }
        // }
    }

    /**
     * Handler called by ember-simple-auth upon successful login
     */
    async sessionAuthenticated() {
        //TODO hook up getting current user data from /v2/Session/WhoAmI/

        // try {
        //     //get the current user's model before transitioning from the login page
        //     const currentUser = await this.currentUser.load();
        //     return currentUser;
        // } catch (err) {
        //     //handle failures of fetching the current user here (e.g. display error notification toast, etc)
        //     //since current user fetch failed, the user should probably not stay logged in
        //     this.session.invalidate();
        //     throw err;
        // }

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
