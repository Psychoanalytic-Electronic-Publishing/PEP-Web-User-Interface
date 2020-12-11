export enum LanguageCode {
    enUS = 'en-us',
    frFR = 'fr-fr'
}

export interface Language {
    code: LanguageCode;
    label: string;
}

export const LANG_EN_US: Language = {
    code: LanguageCode.enUS,
    label: 'language.codes.enUS'
};

export const LANG_FR_FR: Language = {
    code: LanguageCode.frFR,
    label: 'language.codes.frFR'
};

export const Languages = [LANG_EN_US, LANG_FR_FR];
