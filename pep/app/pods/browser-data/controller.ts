import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import CookiesService from 'ember-cookies/services/cookies';

import { APPLICATION_COOKIE_NAMES } from 'pep/constants/cookies';

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
        APPLICATION_COOKIE_NAMES.forEach((name) => {
            this.cookies.clear(name, {});
        });
        window.location.reload();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browser-data': BrowserData;
    }
}
