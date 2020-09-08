import { set } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import { reject } from 'rsvp';
import SessionService from 'ember-simple-auth/services/session';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import CookiesService from 'ember-cookies/services/cookies';
import merge from 'lodash.merge';
import copy from 'lodash.clonedeep';

import ENV from 'pep/config/environment';
import User from 'pep/pods/user/model';
import {
    DEFAULT_USER_PREFERENCES,
    UserPreferences,
    PreferenceChangeset,
    LOCALSTORAGE_PREFERENCES,
    USER_PREFERENCES_LS_PREFIX,
    COOKIE_PREFERENCES,
    USER_PREFERENCES_COOKIE_NAME
} from 'pep/constants/preferences';

export default class CurrentUserService extends Service {
    @service store!: DS.Store;
    @service session!: SessionService;
    @service fastboot!: FastbootService;
    @service cookies!: CookiesService;

    @tracked user: User | null = null;
    @tracked preferences: UserPreferences | null = null;

    /**
     * Loads the current user from the API
     * @returns {Promise<User>}
     */
    load(): Promise<User> {
        return this.fetchUser();
    }

    /**
     * Refreshes the current user if logged in
     * @returns {Promise}
     */
    refresh(): Promise<User> {
        //only attempt to refresh the user if there is a logged in user
        if (this.session.isAuthenticated) {
            return this.fetchUser();
        }
        return reject();
    }

    /**
     * Fetches the current user model
     * @returns Promise<User>
     */
    async fetchUser(): Promise<User> {
        // TODO reenable when we have a real endpoint to hit
        // const result = await this.store.query('user', { me: true });
        // const user = result[0];

        //TODO remove this when we have a real endpoint to hit
        this.store.pushPayload('user', {
            user: {
                id: 1,
                preferences: copy(DEFAULT_USER_PREFERENCES),
                firstName: 'Joe',
                lastName: 'User',
                username: 'joe.user',
                institutionBrandLogoUrl:
                    'https://www.jhu.edu/assets/themes/machado/assets/images/logos/university-logo-small-vertical-white-no-clear-space-29e2bdee83.png'
            }
        });

        const user = this.store.peekRecord('user', 1)!;

        // TODO can we improve this at all so we dont need to ts-ignore it?
        // @ts-ignore allow setting a non-standard property `user` on the session service instance
        set(this.session, 'user', user);
        this.user = user;
        return user;
    }

    /**
     * Builds the in-memory user preferences object, merging together (in order of precedence):
     *  1. user db record preferences (if logged in/has unique session)
     *  2. cookie preferences
     *  3. localStorage preferences
     */
    setup() {
        const userPrefs = this.user?.preferences ?? {};
        const cookiePrefs = this.loadCookiePrefs();
        const lsPrefs = this.loadLocalStoragePrefs();
        const prefs = merge({}, DEFAULT_USER_PREFERENCES, lsPrefs, cookiePrefs, userPrefs) as UserPreferences;
        this.preferences = prefs;
    }

    /**
     * Loads all user preferences stored in local storage
     * @returns {PreferenceChangeset}
     */
    loadLocalStoragePrefs() {
        const prefs = {} as any;

        // localStorage is not available on the server/in fastboot
        if (this.fastboot.isFastBoot) {
            return prefs;
        }

        LOCALSTORAGE_PREFERENCES.forEach((key) => {
            try {
                const value = localStorage.getItem(`${USER_PREFERENCES_LS_PREFIX}_${key}`);
                if (typeof value === 'string') {
                    prefs[key] = JSON.parse(value);
                }
            } catch (err) {
                // swallow errors and dont set the pref at all if it fails
            }
        });

        return prefs;
    }

    /**
     * Loads all user preferences stored in cookies
     * @returns {PreferenceChangeset}
     */
    loadCookiePrefs() {
        const prefs = {} as any;
        const cookie = this.cookies.read(USER_PREFERENCES_COOKIE_NAME, {
            secure: Number(ENV.cookieSecure) === 1,
            sameSite: ENV.cookieSameSite
        });

        if (!cookie) {
            return prefs;
        }

        try {
            const cookieValues = JSON.parse(cookie);
            COOKIE_PREFERENCES.forEach((key) => {
                if (typeof cookieValues[key] !== 'undefined') {
                    prefs[key] = cookieValues[key];
                }
            });

            return prefs;
        } catch (err) {
            return prefs;
        }
    }

    /**
     * Updates the specified preference fields with the given values in the
     * user's browser cookie, localstorage, and session user db record (if uniquely logged in)
     * @param {PreferenceChangeset} prefValues
     * @returns Promise<User | void>
     */
    updatePrefs(prefValues: PreferenceChangeset) {
        //@ts-ignore
        console.log(prefValues);
        //TODO iterate over keys in object and set value in correct storage (localStorage vs cookie, or neither)

        //TODO if the user is logged in:
        if (this.session.isAuthenticated && this.user) {
            //update the user record locally, and .save() it
            //if the user had no existing preferences, (no version field), make sure to set it
        }
    }
}
