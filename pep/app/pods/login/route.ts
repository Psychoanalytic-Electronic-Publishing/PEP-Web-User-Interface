import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import AuthService from 'pep/services/auth';
import PepSessionService from 'pep/services/pep-session';

export default class Login extends Route {
    @service('pep-session') session!: PepSessionService;
    @service auth!: AuthService;
    classNames = ['login'];
    routeIfAlreadyAuthenticated = 'index';

    /**
     * Redirect to the home page and open the login modal
     */
    async redirect() {
        if (!this.session.isAuthenticated) {
            await this.transitionTo('index');
            return this.auth.openLoginModal();
        }
    }
}
