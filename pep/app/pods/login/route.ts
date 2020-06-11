import PageLayout from 'pep/mixins/page-layout';
import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

//TODO login will probably be a modal instead of a full page in this app
export default class Login extends PageLayout(Route.extend(UnauthenticatedRouteMixin)) {
    classNames = ['login'];
    routeIfAlreadyAuthenticated = 'landing-route-here';
}
