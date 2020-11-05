export enum ThemeId {
    DEFAULT = 'default',
    TOMATO = 'tomato'
}

export interface Theme {
    id: ThemeId;
    cssPath: string;
    label: string;
    colors: {
        links: {
            glossary: string;
            bibliography: string;
            pageReference: string;
            external: string;
            figure: string;
            webExternal: string;
            webInternal: string;
            special: string;
        };
    };
}

export const THEME_DEFAULT: Theme = {
    id: ThemeId.DEFAULT,
    cssPath: '/assets/pep.css',
    label: 'theme.themes.default',
    colors: {
        links: {
            glossary: '#28abb9',
            bibliography: '#2d6187',
            pageReference: '#32e0c4',
            external: '#a8dda8',
            figure: '#f5a25d',
            webExternal: '#fa7f72',
            webInternal: '#94b4a4',
            special: '#32e0c4'
        }
    }
};

export const THEME_TOMATO: Theme = {
    id: ThemeId.TOMATO,
    cssPath: '/assets/themes/tomato.css',
    label: 'theme.themes.tomato',
    colors: {
        links: {
            glossary: '#bf3c30',
            bibliography: '#4e89ae',
            pageReference: '#43658b',
            external: '#ffa372',
            figure: '#89c9b8',
            webExternal: '#84a9ac',
            webInternal: '#94b4a4',
            special: '#2d4059'
        }
    }
};

export default [THEME_DEFAULT, THEME_TOMATO];
