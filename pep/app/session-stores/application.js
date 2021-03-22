import CookieStore from 'ember-simple-auth/session-stores/cookie';
import ENV from 'pep/config/environment';
import { SESSION_COOKIE_NAME } from 'pep/constants/cookies';

export default CookieStore.extend({
    cookieName: SESSION_COOKIE_NAME,
    cookieExpirationTime: 60 * 60 * 24 * 365 // 1 year
    // sameSite: ENV.cookieSameSite
});
