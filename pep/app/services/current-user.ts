import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import CookiesService from 'ember-cookies/services/cookies';
import DS from 'ember-data';

import ENV from 'pep/config/environment';
import { DATE_FOREVER } from 'pep/constants/dates';
import {
    COOKIE_PREFERENCES, DEFAULT_USER_PREFERENCES, LOCALSTORAGE_PREFERENCES, PreferenceChangeset, PreferenceDocumentsKey,
    PreferenceKey, USER_PREFERENCES_COOKIE_NAME, USER_PREFERENCES_LS_PREFIX, UserPreferences
} from 'pep/constants/preferences';
import User, { UserType } from 'pep/pods/user/model';
import PepSessionService from 'pep/services/pep-session';
import { reject } from 'rsvp';

export default class CurrentUserService extends Service {
    @service store!: DS.Store;
    @service('pep-session') session!: PepSessionService;
    @service fastboot!: FastbootService;
    @service cookies!: CookiesService;

    @tracked user: User | null = null;
    @tracked preferences?: UserPreferences;
    @tracked lastViewedDocumentId?: string;

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
        const { SessionId } = this.session.data.authenticated;
        const user = await this.store.queryRecord('user', { SessionId });
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
        const userPrefs = this.user?.clientSettings ?? {};
        const cookiePrefs = this.loadCookiePrefs();
        const lsPrefs = this.loadLocalStoragePrefs();
        const prefs = Object.assign({}, DEFAULT_USER_PREFERENCES, lsPrefs, cookiePrefs, userPrefs) as UserPreferences;
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
        const cookie = this.cookies.read(USER_PREFERENCES_COOKIE_NAME);

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
        const cookie = this.cookies.read(USER_PREFERENCES_COOKIE_NAME);
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
                secure: ENV.cookieSecure,
                sameSite: ENV.cookieSameSite,
                expires: DATE_FOREVER
            });
        }

        // if the user is logged in, apply the new prefs locally, then save the user
        if (this.session.isAuthenticated && this.user && this.user.userType !== UserType.GROUP) {
            const oldUserPrefs = this.user?.clientSettings ?? {};
            const newUserPrefs = Object.assign(
                {},
                DEFAULT_USER_PREFERENCES,
                oldUserPrefs,
                prefValues
            ) as UserPreferences;
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

    /**
     * Add document to local storage based upon the preference key that can be passed in and the document.
     * Does not add in duplicates
     *
     * @param {PreferenceDocumentsKey} key
     * @param {Document} document
     * @memberof CurrentUserService
     */
    addPreferenceDocument(key: PreferenceDocumentsKey, documentId: string) {
        let currentDocs = this.getPreferenceDocuments(key);
        if (!currentDocs.includes(documentId)) {
            currentDocs = [...currentDocs, documentId];
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
    hasPreferenceDocument(key: PreferenceDocumentsKey, documentId: string): boolean {
        const currentDocs = this.getPreferenceDocuments(key);
        return !!currentDocs?.includes(documentId);
    }

    /**
     * Remove document from local storage based upon the preference key that can be passed in and the document.
     *
     * @param {PreferenceDocumentsKey} key
     * @param {Document} document
     * @memberof CurrentUserService
     */
    removePreferenceDocument(key: PreferenceDocumentsKey, documentId: string) {
        const currentDocs = this.getPreferenceDocuments(key);
        const newDocs = currentDocs.filter((id) => id !== documentId);
        this.updatePrefs({
            [key]: newDocs
        });
    }

    /**
     * Retrieves all documents for a specific preference key
     *
     * @param {PreferenceDocumentsKey} key
     * @returns {Document[]}
     * @memberof CurrentUserService
     */
    getPreferenceDocuments(key: PreferenceDocumentsKey): string[] {
        const prefs = this.preferences;
        return prefs?.[key] ?? [];
    }
}
