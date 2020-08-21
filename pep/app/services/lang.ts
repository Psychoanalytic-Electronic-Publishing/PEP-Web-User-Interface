import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import IntlService from 'ember-intl/services/intl';

import { LanguageCode } from 'pep/constants/lang';

export default class LangService extends Service {
    @service intl!: IntlService;

    @tracked currentLanguage: LanguageCode = LanguageCode.enUS;

    /**
     * Initialize the app with the user's current language
     */
    setup() {
        //TODO pull and set currentLanguage from unauthed cookies and/or user session
        //(and possibly allow setting via ?lang={code} app-level query param
        this.intl.setLocale(this.currentLanguage);
    }

    /**
     * Updates the user's current language
     * @param {string} lang
     */
    changeLanguage(lang: LanguageCode) {
        //TODO update cookie/user, update intl's language, fetch new content configs, etc
        this.currentLanguage = lang;
        this.intl.setLocale(lang);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        lang: LangService;
    }
}
