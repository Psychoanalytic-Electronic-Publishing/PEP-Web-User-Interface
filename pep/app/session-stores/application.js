import CookieStore from 'ember-simple-auth/session-stores/cookie';

export default CookieStore.extend({
    cookieExpirationTime: 2592000 //30 days
});
