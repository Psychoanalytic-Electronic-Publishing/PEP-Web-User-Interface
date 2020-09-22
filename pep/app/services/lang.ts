import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import { LanguageCode, LANG_EN_US } from 'pep/constants/lang';
import { PreferenceKey } from 'pep/constants/preferences';

export default class LangService extends Service {
    @service intl!: IntlService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;

    @tracked currentLanguage: LanguageCode = LanguageCode.enUS;

    /**
     * Initialize the app with the user's current language
     */
    setup() {
        // TODO eventually possibly allow setting via ?lang={code} app-level query param
        this.currentLanguage = this.currentUser.preferences?.lang ?? LANG_EN_US.code;
        this.intl.setLocale(this.currentLanguage);
    }

    /**
     * Updates the user's current language
     * @param {string} lang
     * @returns {Promise<void>}
     */
    changeLanguage(lang: LanguageCode) {
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
