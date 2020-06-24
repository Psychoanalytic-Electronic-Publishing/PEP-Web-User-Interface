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

    async redirect() {
        if (!this.session.isAuthenticated) {
            //redirect to the home page and open the login modal
            await this.transitionTo('index');
            return this.auth.openLoginModal();
        }
    }
}
