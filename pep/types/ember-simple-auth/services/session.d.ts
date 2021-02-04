declare module 'ember-simple-auth/services/session' {
import Evented from '@ember/object/evented';
import Transition from '@ember/routing/-private/transition';
import Service from '@ember/service';

import User from 'pep/pods/user/model';
import RSVP from 'rsvp';

        export default class session extends Service.extend(Evented) {
        /**
         * Triggered whenever the session is successfully authenticated. This happens
         * when the session gets authenticated via
         * {{#crossLink "SessionService/authenticate:method"}}{{/crossLink}} but also
         * when the session is authenticated in another tab or window of the same
         * application and the session state gets synchronized across tabs or windows
         * via the store (see
         * {{#crossLink "BaseStore/sessionDataUpdated:event"}}{{/crossLink}}).
         * When using the {{#crossLink "ApplicationRouteMixin"}}{{/crossLink}} this
         * event will automatically get handled (see
         * {{#crossLink "ApplicationRouteMixin/sessionAuthenticated:method"}}{{/crossLink}}).
         * @event authenticationSucceeded
         * @public
         */

        /**
         * Triggered whenever the session is successfully invalidated. This happens
         * when the session gets invalidated via
         * {{#crossLink "SessionService/invalidate:method"}}{{/crossLink}} but also
         * when the session is invalidated in another tab or window of the same
         * application and the session state gets synchronized across tabs or windows
         * via the store (see
         * {{#crossLink "BaseStore/sessionDataUpdated:event"}}{{/crossLink}}).
         * When using the {{#crossLink "ApplicationRouteMixin"}}{{/crossLink}} this
         * event will automatically get handled (see
         * {{#crossLink "ApplicationRouteMixin/sessionInvalidated:method"}}{{/crossLink}}).
         * @event invalidationSucceeded
         * @public
         */

        isAuthenticated: boolean;
        isAuthenticating: boolean;
        store: any;
        attemptedTransition: any;
        session: any;
        user: User;

        set<K extends keyof this>(key: K, value: this[K]): this[K];
        authenticate(...args: any[]): RSVP.Promise<Record<string, unknown>>;
        invalidate(...args: any): RSVP.Promise<Record<string, unknown>>;
        authorize(...args: any[]): RSVP.Promise<Record<string, unknown>>;

        /**
            Checks whether the session is authenticated and if it is not, transitions
            to the specified route or invokes the specified callback.
            If a transition is in progress and is aborted, this method will save it in the
            session service's
            {{#crossLink "SessionService/attemptedTransition:property"}}{{/crossLink}}
            property so that  it can be retried after the session is authenticated. If
            the transition is aborted in Fastboot mode, the transition's target URL
            will be saved in a `ember_simple_auth-redirectTarget` cookie for use by the
            browser after authentication is complete.
            @method requireAuthentication
            @param {Transition} transition A transition that triggered the authentication requirement or null if the requirement originated independently of a transition
            @param {String|Function} routeOrCallback The route to transition to in case that the session is not authenticated or a callback function to invoke in that case
            @return {Boolean} true when the session is authenticated, false otherwise
            @public
        */
        requireAuthentication(transition: Transition, routeOrCallback: string | (() => void)): boolean;

        /**
            Checks whether the session is authenticated and if it is, transitions
            to the specified route or invokes the specified callback.
            @method prohibitAuthentication
            @param {String|Function} routeOrCallback The route to transition to in case that the session is authenticated or a callback function to invoke in that case
            @return {Boolean} true when the session is not authenticated, false otherwise
            @public
        */
        prohibitAuthentication(routeOrCallback: string | (() => void)): boolean;

        /**
            This method is called whenever the session goes from being unauthenticated
            to being authenticated. If there is a transition that was previously
            intercepted by the
            {{#crossLink "SessionService/requireAuthentication:method"}}{{/crossLink}},
            it will retry it. If there is no such transition, the
            `ember_simple_auth-redirectTarget` cookie will be checked for a url that
            represents an attemptedTransition that was aborted in Fastboot mode,
            otherwise this action transitions to the specified
            routeAfterAuthentication.
            @method handleAuthentication
            @param {String} routeAfterAuthentication The route to transition to
            @public
        */
        handleAuthentication(routeAfterAuthentication: string): void;

        /**
            This method is called whenever the session goes from being authenticated to
            not being authenticated. __It reloads the Ember.js application__ by
            redirecting the browser to the specified route so that all in-memory data
            (such as Ember Data stores etc.) gets cleared.
            If the Ember.js application will be used in an environment where the users
            don't have direct access to any data stored on the client (e.g.
            [cordova](http://cordova.apache.org)) this action can be overridden to e.g.
            simply transition to the index route.
            @method handleInvalidation
            @param {String} routeAfterInvalidation The route to transition to
            @public
        */
        handleInvalidation(routeAfterInvalidation: string): void;
    }
}
