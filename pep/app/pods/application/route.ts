import PageLayout from 'pep/mixins/page-layout';
import CurrentUserService from 'pep/services/current-user';
import { action } from '@ember/object';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import IntlService from 'ember-intl/services/intl';
import ApplicationRouteMixin from 'ember-simple-auth/mixins/application-route-mixin';
import SessionService from 'ember-simple-auth/services/session';
import LoadingBar from 'pep/services/loading-bar';
import Sidebar from 'pep/services/sidebar';

export default class Application extends PageLayout(Route.extend(ApplicationRouteMixin)) {
    routeAfterAuthentication = 'dashboard';
    @service currentUser!: CurrentUserService;
    @service session!: SessionService;
    @service intl!: IntlService;
    @service fastboot!: FastbootService;
    @service loadingBar!: LoadingBar;
    @service sidebar!: Sidebar;
    @service media;

    async beforeModel(transition: Transition) {
        super.beforeModel(transition);
        this.intl.setLocale('en-us');
        // if (this.session.isAuthenticated) {
        //     try {
        //         await this.currentUser.load();
        //     } catch (err) {
        //         this.replaceWith('five-hundred');
        //     }
        // }
    }

    async sessionAuthenticated() {
        // try {
        //     //get the current user's model before transitioning from the login page
        //     const currentUser = await this.currentUser.load();
        //     //@ts-ignore TODO we need a way to inform TS about class members coming from Ember-style mixins
        //     super.sessionAuthenticated(...arguments);
        //     return currentUser;
        // } catch (err) {
        //     //handle failures of fetching the current user here (e.g. display error notification toast, etc)
        //     //since current user fetch failed, the user should probably not stay logged in
        //     this.session.invalidate();
        //     throw err;
        // }
    }

    /**
     * Invoked when transitioning to routes that do not immediately resolve
     * @param {Object} transition
     */
    @action
    loading(transition) {
        //show the app loading progress bar to indicate
        //that the app is in a loading state when transitioning between routes
        this.loadingBar.show();
        transition.promise.finally(() => this.loadingBar.hide());

        //allows loading routes to be shown if needed
        return true;
    }

    @action
    didTransition() {
        //when transitioning to a new route, close sidebars on mobile/tablet
        if (this.media.isMobile || this.media.isTablet) {
            this.sidebar.toggleAll(false);
        }
    }

    @action
    error(error?: any) {
        if (this.fastboot.isFastBoot) {
            this.fastboot.response.statusCode = error?.errors?.firstObject?.status ?? 200;
        }
        if (error?.errors?.length > 0) {
            const status = error.errors.firstObject.status;
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
