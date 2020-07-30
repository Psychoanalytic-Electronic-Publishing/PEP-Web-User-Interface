import Service from '@ember/service';
import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import THEMES, { THEME_DEFAULT } from 'pep/constants/themes';
import HeadDataService from 'ember-cli-head/services/head-data';

export default class Theme extends Service {
    @service headData!: HeadDataService;
    @service session!: SessionService;

    allThemes = THEMES;

    get currentTheme() {
        return THEMES.findBy('id', this.session.data?.themeId) ?? THEME_DEFAULT;
    }

    /**
     * Sets the currently selected theme CSS in the page <head>
     */
    setup() {
        this.headData.set('themePath', this.currentTheme.cssPath);
    }

    /**
     * Updates the user's selected theme
     * @param {String} newThemeId
     */
    updateTheme(newThemeId: string) {
        //@ts-ignore TODO need to allow arbitrary set() paths in ember-simple-auth/services/session
        this.session.set('data.themeId', newThemeId);
        this.setup();
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        theme: Theme;
    }
}
