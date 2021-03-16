import { inject as service } from '@ember/service';

import classic from 'ember-classic-decorator';
import CookiesService from 'ember-cookies/services/cookies';
import SessionService from 'ember-simple-auth/services/session';

import { removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { PepSecureAuthenticatedData } from 'pep/api';
import ENV from 'pep/config/environment';
import { DATE_FOREVER } from 'pep/constants/dates';
import AuthService from 'pep/services/auth';
import { SESSION_COOKIE_NAME } from 'pep/session-stores/application';
import { serializeQueryParams } from 'pep/utils/url';
import { onAuthenticated } from 'pep/utils/user';

export interface AuthenticatedData {
    authenticated: PepSecureAuthenticatedData;
}

export const UNAUTHENTICATED_SESSION_COOKIE_NAME = 'pepweb_unauthenticated_session';

/**
 * We extend the ember-simple-auth session to strongly type the data object thats stored in it since
 * we need a custom format
 *
 * @export
 * @class Session
 * @extends 'ember-simple-auth/services/session
 */
@classic
export default class PepSessionService extends SessionService {
    @service cookies!: CookiesService;
    @service auth!: AuthService;

    /**
     * Get logged in sessionId if it exists, or logged out sessionId if it does not
     *
     * @readonly
     * @type {(string | undefined)}
     * @memberof PepSessionService
     */
    get sessionId(): string | undefined {
        return this.isAuthenticated ? this.data?.authenticated.SessionId : this.getUnauthenticatedSession()?.SessionId;
    }
    /**
     * Set the unauthed session date in a cookie
     *
     * @param {PepSecureAuthenticatedData} sessionData
     * @memberof PepSessionService
     */
    setUnauthenticatedSession(sessionData: PepSecureAuthenticatedData) {
        const resultString = JSON.stringify(sessionData);
        this.cookies.write(UNAUTHENTICATED_SESSION_COOKIE_NAME, resultString, {
            secure: ENV.cookieSecure,
            sameSite: ENV.cookieSameSite,
            expires: DATE_FOREVER
        });
    }

    /**
     * Get the unauthed session data
     *
     * @returns {(PepSecureAuthenticatedData | undefined)}
     * @memberof PepSessionService
     */
    getUnauthenticatedSession(): PepSecureAuthenticatedData | undefined {
        const cookie = this.cookies.read(UNAUTHENTICATED_SESSION_COOKIE_NAME);
        return cookie ? JSON.parse(cookie) : undefined;
    }

    /**
     * Clear the unauthed session data. This only happens when when the user successfully logs in
     *
     * @memberof PepSessionService
     */
    clearUnauthenticatedSession() {
        this.cookies.clear(UNAUTHENTICATED_SESSION_COOKIE_NAME, {
            secure: ENV.cookieSecure,
            sameSite: ENV.cookieSameSite
        });
    }

    get downloadAuthParams() {
        const queryPrams = {
            'client-id': ENV.clientId,
            'client-session': this.data?.authenticated.SessionId ?? ''
        };
        const normalizedParams = removeEmptyQueryParams(queryPrams);
        return serializeQueryParams(normalizedParams);
    }

    handleAuthentication(routeAfterAuthentication: string): void {
        onAuthenticated(this);

        // trigger a custom event on the session that tells us when the user is logged in
        // and all other post-login tasks (loading user record, prefs/configs setup, etc) is complete
        // as the built-in `authenticationSucceeded` event fires immediately after the login request returns
        this.session.trigger('authenticationAndSetupSucceeded');
        this.clearUnauthenticatedSession();
        // dont redirect the user on login if the behavior is suppressed
        if (this.auth.dontRedirectOnLogin) {
            this.auth.dontRedirectOnLogin = false;
        } else {
            super.handleAuthentication(routeAfterAuthentication);
        }
    }

    handleInvalidation(routeAfterInvalidation: string): void {
        this.cookies.write(SESSION_COOKIE_NAME, JSON.stringify({ authenticated: {} }), {});
        super.handleInvalidation(routeAfterInvalidation);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        session: PepSessionService;
    }
}