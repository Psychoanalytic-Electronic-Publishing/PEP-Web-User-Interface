import Service, { inject as service } from '@ember/service';

import HeadDataService from 'ember-cli-head/services/head-data';
import IntlService from 'ember-intl/services/intl';

import { PreferenceKey } from 'pep/constants/preferences';
import THEMES, { THEME_DEFAULT, ThemeId } from 'pep/constants/themes';
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
     * Sets the currently selected theme CSS in the page <head>. Only gets run in fastboot
     */
    setup() {
        this.headData.set('themePath', this.currentTheme.cssPath);
    }

    /**
     * Updates the user's selected theme
     * @param {ThemeId} newThemeId
     */
    updateTheme(newThemeId: ThemeId) {
        this.currentUser.updatePrefs({ [PreferenceKey.THEME]: newThemeId });
        const theme = window.document.querySelector('#theme');
        if (theme) {
            theme?.setAttribute('href', this.currentTheme.cssPath);
        } else {
            const linkElement = window.document.createElement('link');
            linkElement.setAttribute('rel', 'stylesheet');
            linkElement.setAttribute('type', 'text/css');
            linkElement.setAttribute('id', 'theme');
            linkElement.setAttribute('href', this.currentTheme.cssPath);
            window.document.head.appendChild(linkElement);
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        theme: ThemeService;
    }
}
