import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import CookiesService from 'ember-cookies/services/cookies';

import { USER_PREFERENCES_COOKIE_NAME } from 'pep/constants/preferences';
import { UNAUTHENTICATED_SESSION_COOKIE_NAME } from 'pep/services/session';
import { SESSION_COOKIE_NAME } from 'pep/session-stores/application';

export default class BrowserData extends Controller {
    @service cookies!: CookiesService;

    /**
     * Clear all local storage and cookies
     *
     * @memberof BrowserData
     */
    @action
    clearData(): void {
        localStorage.clear();
        this.cookies.clear('pep_session_fastboot', {});
        this.cookies.write(SESSION_COOKIE_NAME, JSON.stringify({ authenticated: {} }), {});
        this.cookies.clear(USER_PREFERENCES_COOKIE_NAME, {});
        this.cookies.clear(`${SESSION_COOKIE_NAME}-expiration_time`, {});
        this.cookies.clear(UNAUTHENTICATED_SESSION_COOKIE_NAME, {});
        window.location.reload();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browser-data': BrowserData;
    }
}
