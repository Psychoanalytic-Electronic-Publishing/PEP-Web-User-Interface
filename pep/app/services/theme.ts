import Service, { inject as service } from '@ember/service';

import HeadDataService from 'ember-cli-head/services/head-data';
import IntlService from 'ember-intl/services/intl';

import Color from 'color';
import { PreferenceKey } from 'pep/constants/preferences';
import THEMES, { THEME_DEFAULT, ThemeId } from 'pep/constants/themes';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/pep-session';

export default class ThemeService extends Service {
    @service headData!: HeadDataService;
    @service('pep-session') session!: PepSessionService;
    @service intl!: IntlService;
    @service currentUser!: CurrentUserService;

    allThemes = THEMES;

    get themeOptions() {
        return this.allThemes.map((theme) => ({
            ...theme,
            label: this.intl.t(theme.label)
        }));
    }

    get currentTheme() {
        return THEMES.findBy('id', this.currentUser.preferences?.theme) ?? THEME_DEFAULT;
    }

    /**
     * Sets the currently selected theme CSS in the page <head>
     */
    setup() {
        this.headData.set('themePath', this.currentTheme.cssPath);
        // this.injectLinkColors();
    }

    /**
     * Updates the user's selected theme
     * @param {ThemeId} newThemeId
     */
    updateTheme(newThemeId: ThemeId) {
        this.currentUser.updatePrefs({ [PreferenceKey.THEME]: newThemeId });
        this.setup();
    }

    @dontRunInFastboot
    injectLinkColors() {
        const colors = this.currentTheme.colors.links;
        const styles = `
            .glosstip {
                background-color: ${Color(colors.glossary).alpha(0.075)};
            }
            .glosstip:hover {
                color: ${colors.glossary};
            }
            .bibtip {
                color: ${colors.bibliography}
            }
            .pgx {
                color: ${colors.pageReference}
            }
            .figuretip {
                color: ${colors.figure}
            }
        `;
        this.headData.set('linkColors', styles);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        theme: ThemeService;
    }
}
