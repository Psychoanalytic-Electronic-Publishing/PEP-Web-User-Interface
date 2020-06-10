import PageLayout from 'pep/mixins/page-layout';
import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default class Login extends PageLayout(Route.extend(UnauthenticatedRouteMixin)) {
    classNames = ['login'];
    routeIfAlreadyAuthenticated = 'landing-route-here';
}
