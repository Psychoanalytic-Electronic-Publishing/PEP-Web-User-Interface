import CookieStore from 'ember-simple-auth/session-stores/cookie';
import ENV from 'pep/config/environment';
import { SESSION_COOKIE_NAME } from 'pep/constants/cookies';
import classic from 'ember-classic-decorator';
import { COOKIE_PATH } from 'pep/constants/cookies';

@classic
export default class ApplicationSessionStore extends CookieStore {
    cookieName = SESSION_COOKIE_NAME;
    cookieExpirationTime = 60 * 60 * 24 * 365;
    sameSite = ENV.cookieSameSite;
    cookiePath = COOKIE_PATH;
}
