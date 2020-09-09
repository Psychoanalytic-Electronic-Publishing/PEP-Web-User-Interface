declare module 'ember-simple-auth/services/session' {
    import Service from '@ember/service';
    import Evented from '@ember/object/evented';
    import RSVP from 'rsvp';
    import User from 'pep/pods/user/model';

    interface SessionAuthenticatedData {
        id: string;
        id_token: string;
        access_token: string;
        refresh_token: string;
        expires_in: number;
        expires_at: number;
    }

    interface SessionData {
        authenticated: SessionAuthenticatedData;
    }

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
        data: SessionData | null;
        store: any;
        attemptedTransition: any;
        session: any;
        user: User;

        set<K extends keyof this>(key: K, value: this[K]): this[K];
        authenticate(...args: any[]): RSVP.Promise<{}>;
        invalidate(...args: any): RSVP.Promise<{}>;
        authorize(...args: any[]): RSVP.Promise<{}>;
    }
}
