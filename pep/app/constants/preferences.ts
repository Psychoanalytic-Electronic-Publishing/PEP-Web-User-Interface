import ENV from 'pep/config/environment';
import { ThemeId } from 'pep/constants/themes';
import { LanguageCode } from 'pep/constants/lang';
import { SearchTermId } from 'pep/constants/search';

export enum PreferenceKey {
    FAVORITES = 'favorites',
    THEME = 'theme',
    LANG = 'lang',
    SEARCH_LIMIT_IS_SHOWN = 'searchLimitIsShown',
    SEARCH_TERM_FIELDS = 'searchTermFields',
    READ_LATER = 'readLater'
}

export interface UserPreferences {
    favorites?: string[];
    preferencesVersion: string;
    theme: ThemeId;
    lang: LanguageCode;
    searchLimitIsShown?: boolean;
    searchTermFields?: SearchTermId[];
    readLater?: string[];
}

export type PreferenceChangeset = {
    favorites?: string[];
    preferencesVersion?: string;
    theme?: ThemeId;
    lang?: LanguageCode;
    searchLimitIsShown?: boolean;
    searchTermFields?: SearchTermId[];
    readLater?: string[];
};

export type PreferenceDocumentsKey = PreferenceKey.READ_LATER | PreferenceKey.FAVORITES;

export const USER_PREFERENCES_COOKIE_NAME = 'pepweb_user_prefs';
export const USER_PREFERENCES_LS_PREFIX = 'pepweb_user_prefs';

/**
 * IMPORTANT!!!
 * User preferences that are stored in a browser cookie which are accessible on the server-side/FastBoot.
 * Because of browsers' cookie size upper limit of ~4KB (shared between ALL cookies for the domain)
 * Only preferences the are ABSOLUTELY CRITICAL for FastBoot renders (or are extremely small values)
 * should be placed in here. Everything else should go in LOCALSTORAGE_PREFERENCES
 */
export const COOKIE_PREFERENCES: PreferenceKey[] = [
    PreferenceKey.THEME,
    PreferenceKey.LANG,
    PreferenceKey.SEARCH_LIMIT_IS_SHOWN,
    PreferenceKey.SEARCH_TERM_FIELDS
];

/**
 * All user preferences that are not stored in COOKIE_PREFERENCES must be stored in LocalStorage
 * Note that as LocalStorage is clientside-only, the user-set values for these prefs will not be
 * accessible in FastBoot (the default preference value will be returned if access is attempted)
 */
export const LOCALSTORAGE_PREFERENCES: PreferenceKey[] = [PreferenceKey.READ_LATER, PreferenceKey.FAVORITES];

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    preferencesVersion: ENV.userPreferencesVersion,
    theme: ThemeId.DEFAULT,
    lang: LanguageCode.enUS
};
