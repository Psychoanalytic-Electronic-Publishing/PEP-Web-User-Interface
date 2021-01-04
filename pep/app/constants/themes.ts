export enum ThemeId {
    DEFAULT = 'default',
    TOMATO = 'tomato',
    DARK = 'dark',
    HIGH_CONTRAST = 'high-contrast'
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

export const THEME_DARK: Theme = {
    id: ThemeId.DARK,
    cssPath: '/assets/themes/dark.css',
    label: 'theme.themes.dark'
};

export const THEME_HIGH_CONTRAST: Theme = {
    id: ThemeId.HIGH_CONTRAST,
    cssPath: '/assets/themes/high-contrast.css',
    label: 'theme.themes.highContrast'
};

export default [THEME_DEFAULT, THEME_TOMATO, THEME_DARK, THEME_HIGH_CONTRAST];
