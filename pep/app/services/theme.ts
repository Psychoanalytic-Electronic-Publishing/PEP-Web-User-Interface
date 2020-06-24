import Service from '@ember/service';
// import { isNone } from '@ember/utils';
// import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import THEMES, { THEME_DEFAULT } from 'pep/constants/themes';

export default class Theme extends Service {
    @service headData;
    @service session!: SessionService;

    allThemes = THEMES;

    get currentTheme() {
        return THEMES.findBy('id', this.session.data?.themeId) ?? THEME_DEFAULT;
    }

    setup() {
        this.headData.set('themePath', this.currentTheme.cssPath);
    }

    updateTheme(newThemeId) {
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
