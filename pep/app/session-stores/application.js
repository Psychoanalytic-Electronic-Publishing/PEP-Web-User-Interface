import CookieStore from 'ember-simple-auth/session-stores/cookie';
import ENV from 'pep/config/environment';

export default CookieStore.extend({
    cookieExpirationTime: 60 * 60 * 24 * 365, // 1 year
    sameSite: ENV.cookieSameSite
});
