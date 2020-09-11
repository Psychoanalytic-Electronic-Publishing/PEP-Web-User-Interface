import { set } from '@ember/object';
import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import { reject } from 'rsvp';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import CookiesService from 'ember-cookies/services/cookies';
import merge from 'lodash.merge';

import ENV from 'pep/config/environment';
import User from 'pep/pods/user/model';
import {
    DEFAULT_USER_PREFERENCES,
    UserPreferences,
    PreferenceChangeset,
    LOCALSTORAGE_PREFERENCES,
    USER_PREFERENCES_LS_PREFIX,
    COOKIE_PREFERENCES,
    USER_PREFERENCES_COOKIE_NAME,
    PreferenceKey,
    PreferenceDocumentsKey
} from 'pep/constants/preferences';
import Document from 'pep/pods/document/model';
import PepSessionService from 'pep/services/pep-session';

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
                preferences: {},
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
     *  4. default preference values
     * @returns {UserPreferences}
     */
    setup() {
        const userPrefs = this.user?.preferences ?? {};
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
            const oldUserPrefs = this.user?.preferences ?? {};
            const newUserPrefs = merge({}, DEFAULT_USER_PREFERENCES, oldUserPrefs, prefValues);
            this.user.preferences = newUserPrefs;
            this.setup();
            await this.user.save();
            return this.preferences;
            // otherwise, just apply the prefs locally (cookies/localstorage)
        } else {
            this.setup();
            return this.preferences;
        }
    }

    /**
     * Add document to local storage based upon the preference key that can be passed in and the document.
     * Does not add in duplicates
     *
     * @param {PreferenceDocumentsKey} key
     * @param {Document} document
     * @memberof CurrentUserService
     */
    addDocument(key: PreferenceDocumentsKey, document: Document) {
        const prefs = this.loadLocalStoragePrefs();
        const currentDocs = prefs[key] ?? [];
        if (!currentDocs?.find((documentToFind) => documentToFind.id === document.id)) {
            currentDocs?.push(document.toJSON({ includeId: true }) as Document);
        }
        this.updatePrefs({
            [key]: currentDocs
        });
    }

    /**
     * Checks if the document for the specific key exists in the document array for that key
     *
     * @param {PreferenceDocumentsKey} key
     * @param {Document} document
     * @returns {boolean}
     * @memberof CurrentUserService
     */
    hasDocument(key: PreferenceDocumentsKey, document: Document): boolean {
        const prefs = this.loadLocalStoragePrefs();
        const currentDocs = prefs[key] ?? [];
        return !!currentDocs?.find((documentToFind) => documentToFind.id === document.id);
    }

    /**
     * Remove document from local storage based upon the preference key that can be passed in and the document.
     *
     * @param {PreferenceDocumentsKey} key
     * @param {Document} document
     * @memberof CurrentUserService
     */
    removeDocument(key: PreferenceDocumentsKey, document: Document) {
        const prefs = this.loadLocalStoragePrefs();
        const currentDocs = prefs[key];
        const index = currentDocs?.findIndex((documentToFind) => documentToFind.id === document.id);
        if (index !== undefined) {
            currentDocs?.removeAt(index);
        }
        this.updatePrefs({
            [key]: currentDocs
        });
    }

    /**
     * Retrieves all documents for a specific preference key
     *
     * @param {PreferenceDocumentsKey} key
     * @returns {Document[]}
     * @memberof CurrentUserService
     */
    getDocuments(key: PreferenceDocumentsKey): Document[] {
        const prefs = this.loadLocalStoragePrefs();
        return prefs[key] ?? [];
    }
}
