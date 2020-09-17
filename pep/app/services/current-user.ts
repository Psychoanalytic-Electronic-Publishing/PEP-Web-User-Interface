import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import { reject } from 'rsvp';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import CookiesService from 'ember-cookies/services/cookies';
import merge from 'lodash.merge';

import ENV from 'pep/config/environment';
import PepSessionService from 'pep/services/pep-session';
import User from 'pep/pods/user/model';
import {
    DEFAULT_USER_PREFERENCES,
    UserPreferences,
    PreferenceChangeset,
    LOCALSTORAGE_PREFERENCES,
    USER_PREFERENCES_LS_PREFIX,
    COOKIE_PREFERENCES,
    USER_PREFERENCES_COOKIE_NAME,
    PreferenceKey
} from 'pep/constants/preferences';

export default class CurrentUserService extends Service {
    @service store!: DS.Store;
    @service('pep-session') session!: PepSessionService;
    @service fastboot!: FastbootService;
    @service cookies!: CookiesService;

    @tracked user: User | null = null;
    @tracked preferences: UserPreferences | null = null;

    /**
     * Loads the current user from the API
     * @returns {Promise<User>}
     */
    load(): Promise<User | void> {
        return this.fetchUser();
    }

    /**
     * Refreshes the current user if logged in
     * @returns {Promise}
     */
    refresh(): Promise<User | void> {
        //only attempt to refresh the user if there is a logged in user
        if (this.session.isAuthenticated) {
            return this.fetchUser();
        }
        return reject();
    }

    /**
     * Fetches the current user model
     * @returns Promise<User | void>
     */
    async fetchUser(): Promise<User | void> {
        if (this.session.isAuthenticated) {
            const { SessionId } = this.session.data.authenticated;
            const result = await this.store.query('user', { SessionId });
            const users = result.toArray();
            const user = users[0];
            this.user = user;
            return user;
        }
    }

    /**
     * Builds the in-memory user preferences object, merging together (in order of precedence):
     *  1. user db record preferences (if logged in/has unique session)
     *  2. cookie preferences
     *  3. localStorage preferences
     *  4. default preference values
     * @returns {UserPreferences}
     */
    setup() {
        const userPrefs = this.user?.clientSettings ?? {};
        const cookiePrefs = this.loadCookiePrefs();
        const lsPrefs = this.loadLocalStoragePrefs();
        const prefs = merge({}, DEFAULT_USER_PREFERENCES, lsPrefs, cookiePrefs, userPrefs) as UserPreferences;
        this.preferences = prefs;
        return this.preferences;
    }

    /**
     * Loads all user preferences stored in local storage
     * @returns {PreferenceChangeset}
     */
    loadLocalStoragePrefs() {
        const prefs = {} as PreferenceChangeset;

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
        const prefs = {} as PreferenceChangeset;
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
     * @returns Promise<UserPreferences>
     */
    async updatePrefs(prefValues: PreferenceChangeset) {
        const keys = Object.keys(prefValues) as PreferenceKey[];

        const cookie = this.cookies.read(USER_PREFERENCES_COOKIE_NAME, {
            secure: Number(ENV.cookieSecure) === 1,
            sameSite: ENV.cookieSameSite
        });

        const cookieValues = cookie ? JSON.parse(cookie) : {};
        let updatedCookie = false;

        keys.forEach((key) => {
            if (COOKIE_PREFERENCES.includes(key)) {
                updatedCookie = true;
                cookieValues[key] = prefValues[key];
            } else if (LOCALSTORAGE_PREFERENCES.includes(key)) {
                const value = JSON.stringify(prefValues[key]);
                if (!this.fastboot.isFastBoot) {
                    localStorage.setItem(`${USER_PREFERENCES_LS_PREFIX}_${key}`, value);
                }
            }
        });

        if (updatedCookie) {
            const newCookie = JSON.stringify(cookieValues);
            this.cookies.write(USER_PREFERENCES_COOKIE_NAME, newCookie, {
                domain: ENV.cookieDomain,
                secure: Number(ENV.cookieSecure) === 1,
                sameSite: ENV.cookieSameSite,
                expires: new Date('2525-01-01') // never!!!
            });
        }

        // if the user is logged in, apply the new prefs locally, then save the user
        if (this.session.isAuthenticated && this.user) {
            const oldUserPrefs = this.user?.clientSettings ?? {};
            const newUserPrefs = merge({}, DEFAULT_USER_PREFERENCES, oldUserPrefs, prefValues);
            this.user.clientSettings = newUserPrefs;
            this.setup();
            await this.user.save();
            return this.preferences;
            // otherwise, just apply the prefs locally (cookies/localstorage)
        } else {
            this.setup();
            return this.preferences;
        }
    }
}
