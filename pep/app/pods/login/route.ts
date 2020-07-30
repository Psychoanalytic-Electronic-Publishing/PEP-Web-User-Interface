import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';
import SessionService from 'ember-simple-auth/services/session';
import AuthService from 'pep/services/auth';

export default class Login extends Route.extend(UnauthenticatedRouteMixin) {
    @service session!: SessionService;
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
