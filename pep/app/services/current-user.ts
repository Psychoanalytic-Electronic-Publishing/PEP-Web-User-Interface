import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import CookiesService from 'ember-cookies/services/cookies';
import DS from 'ember-data';
import IntlService from 'ember-intl/services/intl';

import ENV from 'pep/config/environment';
import { WidgetConfiguration } from 'pep/constants/configuration';
import { USER_PREFERENCES_COOKIE_NAME } from 'pep/constants/cookies';
import { MAX_AGE } from 'pep/constants/dates';
import {
    COOKIE_PREFERENCES,
    DEFAULT_USER_PREFERENCES,
    LOCALSTORAGE_PREFERENCES,
    PreferenceChangeset,
    PreferenceDocumentsKey,
    PreferenceKey,
    USER_PREFERENCES_LS_PREFIX,
    UserPreferences
} from 'pep/constants/preferences';
import {
    AvailableFontSizes,
    FONT_SIZE_DEFAULT,
    FontSize,
    TEXT_LEFT,
    TextJustificationId,
    TextJustifications
} from 'pep/constants/text';
import USER_LOGIN_METHODS from 'pep/constants/user';
import User, { UserType } from 'pep/pods/user/model';
import AuthService from 'pep/services/auth';
import InformationBarService from 'pep/services/information-bar';
import PepSessionService from 'pep/services/pep-session';
import { addClass, removeClass } from 'pep/utils/dom';
import { reject } from 'rsvp';
import Result, { err, ok } from 'true-myth/result';
import DisqusService from './disqus';

export enum VIEW_DOCUMENT_FROM {
    SEARCH = 'search',
    OTHER = 'other'
}

export enum UserPreferenceErrorId {
    UNAUTHENTICATED = 'unauthenticated',
    GROUP = 'group'
}

export interface UserPreferenceError {
    id: UserPreferenceErrorId;
    message?: string;
}

export default class CurrentUserService extends Service {
    @service store!: DS.Store;
    @service('pep-session') session!: PepSessionService;
    @service fastboot!: FastbootService;
    @service cookies!: CookiesService;
    @service intl!: IntlService;
    @service auth!: AuthService;
    @service informationBar!: InformationBarService;
    @service disqus!: DisqusService;
    // @ts-ignore this does exist
    @service('-document') document!: any;

    @tracked user: User | null = null;
    @tracked preferences?: UserPreferences;

    /**
     * Available text justification options
     *
     * @readonly
     * @memberof CurrentUserService
     */
    get availableTextJustifications() {
        return TextJustifications.map((direction) => ({
            ...direction,
            label: this.intl.t(direction.label)
        }));
    }

    /**
     * Get the current text justification value
     *
     * @readonly
     * @memberof CurrentUserService
     */
    get textJustification() {
        return TextJustifications.find((item) => item.id === this.preferences?.textJustification) ?? TEXT_LEFT;
    }

    /**
     * Available font sizes transformed with internationalization
     *
     * @readonly
     * @memberof CurrentUserService
     */
    get availableFontSizes() {
        return AvailableFontSizes.map((size) => ({
            ...size,
            label: this.intl.t(size.label)
        }));
    }

    /**
     * Get the current font size
     *
     * @readonly
     * @memberof CurrentUserService
     */
    get fontSize() {
        return AvailableFontSizes.find((item) => item.id === this.preferences?.fontSize) ?? FONT_SIZE_DEFAULT;
    }

    get canLogOut() {
        return this.user?.isIndividual ?? false;
    }

    get loggedInLabel() {
        const methodTranslation = USER_LOGIN_METHODS.findBy('id', this.user?.loggedInMethod)?.label ?? '';
        const method = methodTranslation ? this.intl.t(methodTranslation) : '';
        return this.intl.t('user.login.loginMethod', { method });
    }

    get loginTypeLabel() {
        const isGroup = this.user?.isGroup ?? false;
        return isGroup ? this.intl.t('user.login.individual') : '';
    }

    get loginMethodTranslation() {
        const loginMethod = USER_LOGIN_METHODS.findBy('id', this.user?.loggedInMethod);
        const methodTranslation = loginMethod?.logoutLabel ?? loginMethod?.label;
        return methodTranslation ? this.intl.t(methodTranslation) : '';
    }

    get logoutTypeLabel() {
        const isGroup = this.user?.isGroup ?? false;
        const method = this.loginMethodTranslation;
        return isGroup ? this.intl.t('user.login.logoutType', { method }) : '';
    }

    /**
     *Loads the current user from the API
     *
     * @param {string} [sessionId]
     * @return {*}  {(Promise<User | void>)}
     * @memberof CurrentUserService
     */
    async load(sessionId?: string): Promise<User | void> {
        const user = await this.fetchUser(sessionId);

        if (user && user.hasIJPOpenSubscription) await this.disqus.setup();

        return user;
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
     *Fetches the current user model
     *
     * @param {string} [sessionId]
     * @return {*}  {(Promise<User | void>)}
     * @memberof CurrentUserService
     */
    async fetchUser(sessionId?: string): Promise<User | void> {
        const id = sessionId ?? this.session.sessionId;
        const user = await this.store.queryRecord('user', { SessionId: id ?? '' });

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
     * Clear preferences and remove items from cookies and local storage
     *
     * @memberof CurrentUserService
     */
    clearPreferences() {
        this.preferences = undefined;
        this.cookies.clear(USER_PREFERENCES_COOKIE_NAME, {
            secure: ENV.cookieSecure,
            sameSite: ENV.cookieSameSite
        });
        localStorage.clear();
    }

    /**
     * Updates the specified preference fields with the given values in the
     * user's browser cookie, localstorage, and session user db record (if uniquely logged in)
     * @param {PreferenceChangeset} prefValues
     * @returns Promise<UserPreferences>
     */
    async updatePrefs(
        prefValues: PreferenceChangeset
    ): Promise<Result<UserPreferences | undefined, UserPreferenceError>> {
        if (this.user?.userType === UserType.GROUP || !this.session.isAuthenticated) {
            this.informationBar.show('settings-auth');
            const hasWidgetConfigurationChanges =
                prefValues[PreferenceKey.WIDGET_CONFIGURATIONS] && Object.keys(prefValues).length === 1;
            if (hasWidgetConfigurationChanges) {
                return this._updatePrefs(prefValues);
            } else {
                this.informationBar.show('settings-auth');
                const error: UserPreferenceError = {
                    id:
                        this.user?.userType === UserType.GROUP
                            ? UserPreferenceErrorId.GROUP
                            : UserPreferenceErrorId.UNAUTHENTICATED
                };
                return err(error);
            }
        } else {
            return this._updatePrefs(prefValues);
        }
    }

    /**
     * Private update prefs method - not to be used by other classes
     *
     * @param {PreferenceChangeset} prefValues
     * @return {*}  {(Promise<Result<UserPreferences | undefined, UserPreferenceError>>)}
     * @memberof CurrentUserService
     */
    async _updatePrefs(
        prefValues: PreferenceChangeset
    ): Promise<Result<UserPreferences | undefined, UserPreferenceError>> {
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
                sameSite: ENV.cookieSameSite,
                maxAge: MAX_AGE,
                secure: ENV.cookieSecure
            });
        }

        // if the user is logged in, apply the new prefs locally, then save the user
        if (this.session.isAuthenticated && this.user) {
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
            return ok(this.preferences);

            // otherwise, just apply the prefs locally (cookies/localstorage)
        } else {
            this.setup();
            return ok(this.preferences);
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
            currentDocs = [documentId, ...currentDocs];
        }
        return this.updatePrefs({
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
        return this.updatePrefs({
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

    /**
     * Set new font size on html element
     *
     * @param {FontSize} newSize
     * @memberof CurrentUserService
     */
    setFontSize(newSize: FontSize) {
        const document = this.document;
        const target = document.documentElement;
        const size = AvailableFontSizes.find((item) => item.id === newSize) ?? FONT_SIZE_DEFAULT;
        AvailableFontSizes.map((item) => item.class).forEach((item) => {
            removeClass(target, item);
        });

        addClass(target, size.class);
    }

    /**
     * Update the font size by saving to the user preferences
     *
     * @param {FontSize} newSize
     * @memberof CurrentUserService
     */
    updateFontSize(newSize: FontSize) {
        return this.updatePrefs({ [PreferenceKey.FONT_SIZE]: newSize });
    }

    /**
     * Update the text justification by saving to the user preferences
     *
     * @param {TextJustificationId} textJustification
     * @memberof CurrentUserService
     */
    updateTextJustification(textJustification: TextJustificationId) {
        return this.updatePrefs({ [PreferenceKey.TEXT_JUSTIFICATION]: textJustification });
    }

    /**
     * Modify the widget configurations (whether the user has opened or closed the widget pane)
     *
     * @param {WidgetConfiguration[]} widgetConfigurations
     * @return {*}
     * @memberof CurrentUserService
     */
    modifyWidgetConfigurations(widgetConfigurations: WidgetConfiguration[]) {
        const configs = this.preferences?.widgetConfigurations;
        let updatedConfigs = configs;
        widgetConfigurations.forEach((configuration) => {
            const configAlreadyExists = updatedConfigs?.some((item) => item.widget === configuration.widget);

            if (!configAlreadyExists && updatedConfigs) {
                updatedConfigs = [...updatedConfigs, configuration];
            } else if (updatedConfigs) {
                const arrayWithoutConfig = updatedConfigs.filter((item) => item.widget !== configuration.widget);
                updatedConfigs = [...arrayWithoutConfig, configuration];
            }
        });

        return this.updatePrefs({ [PreferenceKey.WIDGET_CONFIGURATIONS]: updatedConfigs });
    }
}
