export enum ThemeId {
    DEFAULT = 'default',
    TOMATO = 'tomato'
}

export interface Theme {
    id: ThemeId;
    cssPath: string;
    label: string;
}

export const THEME_DEFAULT: Theme = {
    id: ThemeId.DEFAULT,
    cssPath: '/assets/pep.css',
    label: 'theme.themes.default'
};

export const THEME_TOMATO: Theme = {
    id: ThemeId.TOMATO,
    cssPath: '/assets/themes/tomato.css',
    label: 'theme.themes.tomato'
};

export default [THEME_DEFAULT, THEME_TOMATO];
