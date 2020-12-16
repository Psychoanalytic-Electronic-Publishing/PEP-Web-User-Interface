import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import IntlService from 'ember-intl/services/intl';

import fetch from 'fetch';
import { LANG_EN_US, LanguageCode, Languages } from 'pep/constants/lang';
import { PreferenceKey } from 'pep/constants/preferences';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';

export default class LangService extends Service {
    @service intl!: IntlService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;

    @tracked currentLanguage: LanguageCode = LanguageCode.EnUS;

    get availableLanguages() {
        return Languages.map((lang) => ({
            ...lang,
            label: this.intl.t(lang.label)
        }));
    }

    /**
     * Initialize the app with the user's current language
     */
    async setup() {
        // TODO eventually possibly allow setting via ?lang={code} app-level query param
        this.currentLanguage = this.currentUser.preferences?.lang ?? LANG_EN_US.code;
        await this.loadLanguage(this.currentLanguage);
        this.intl.setLocale(this.currentLanguage);
    }

    async loadLanguage(lang: LanguageCode) {
        const language = Languages.findBy('code', lang);
        if (language) {
            const translations = await fetch(language.path);
            const translationsAsJson = await translations.json();
            this.intl.addTranslations(lang, translationsAsJson);
        }
    }

    /**
     * Updates the user's current language
     * @param {string} lang
     * @returns {Promise<void>}
     */
    async changeLanguage(lang: LanguageCode) {
        await this.loadLanguage(lang);
        this.currentLanguage = lang;
        this.intl.setLocale(lang);
        this.currentUser.updatePrefs({ [PreferenceKey.LANG]: lang });
        return this.configuration.setup();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        lang: LangService;
    }
}
