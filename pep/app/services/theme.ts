import Service from '@ember/service';
import { inject as service } from '@ember/service';
import HeadDataService from 'ember-cli-head/services/head-data';
import IntlService from 'ember-intl/services/intl';
import PepSessionService from 'pep/services/pep-session';

import CurrentUserService from 'pep/services/current-user';
import THEMES, { THEME_DEFAULT, ThemeId } from 'pep/constants/themes';
import { PreferenceKey } from 'pep/constants/preferences';

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
    }

    /**
     * Updates the user's selected theme
     * @param {ThemeId} newThemeId
     */
    updateTheme(newThemeId: ThemeId) {
        this.currentUser.updatePrefs({ [PreferenceKey.THEME]: newThemeId });
        this.setup();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        theme: ThemeService;
    }
}
