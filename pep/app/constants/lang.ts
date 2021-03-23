export enum LanguageCode {
    EnUS = 'en-us',
    FrFR = 'fr-fr',
    EsES = 'es-es',
    DeDe = 'de-de',
    ItIt = 'it-it'
}

export interface Language {
    code: LanguageCode;
    label: string;
    path: string;
}

export const LANG_EN_US: Language = {
    code: LanguageCode.EnUS,
    label: 'language.codes.enUS',
    path: '/translations/en-us.json'
};

export const LANG_FR_FR: Language = {
    code: LanguageCode.FrFR,
    label: 'language.codes.frFR',
    path: '/translations/fr-fr.json'
};

export const LANG_ES_ES: Language = {
    code: LanguageCode.EsES,
    label: 'language.codes.esES',
    path: '/translations/es-es.json'
};

export const LANG_DE_DE: Language = {
    code: LanguageCode.DeDe,
    label: 'language.codes.deDE',
    path: '/translations/de-de.json'
};
export const LANG_IT_IT: Language = {
    code: LanguageCode.ItIt,
    label: 'language.codes.itIT',
    path: '/translations/it-it.json'
};

export const Languages = [LANG_EN_US, LANG_ES_ES, LANG_FR_FR, LANG_DE_DE, LANG_IT_IT];
