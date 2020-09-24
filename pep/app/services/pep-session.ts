import ENV from 'pep/config/environment';
import SessionService from 'ember-simple-auth/services/session';
import { oneWay } from '@ember/object/computed';
import { PepSecureAuthenticatedData } from 'pep/api';
import CookiesService from 'ember-cookies/services/cookies';
import { inject as service } from '@ember/service';

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
export default class PepSessionService extends SessionService.extend({
    data: (oneWay('session.content') as unknown) as AuthenticatedData
}) {
    @service cookies!: CookiesService;

    get isCookieSecure() {
        return Number(ENV.cookieSecure) === 1;
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
            domain: ENV.cookieDomain,
            secure: this.isCookieSecure,
            sameSite: ENV.cookieSameSite,
            expires: new Date('2525-01-01') // never!!!
        });
    }

    /**
     * Get the unauthed session data
     *
     * @returns {(PepSecureAuthenticatedData | undefined)}
     * @memberof PepSessionService
     */
    getUnauthenticatedSession(): PepSecureAuthenticatedData | undefined {
        const cookie = this.cookies.read(UNAUTHENTICATED_SESSION_COOKIE_NAME, {
            secure: this.isCookieSecure,
            sameSite: ENV.cookieSameSite
        });
        return cookie ? JSON.parse(cookie) : undefined;
    }

    /**
     * Clear the unauthed session data. This only happens when when the user successfully logs in
     *
     * @memberof PepSessionService
     */
    clearUnauthenticatedSession() {
        this.cookies.clear(UNAUTHENTICATED_SESSION_COOKIE_NAME, {
            secure: this.isCookieSecure,
            sameSite: ENV.cookieSameSite
        });
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'pep-session': PepSessionService;
    }
}
