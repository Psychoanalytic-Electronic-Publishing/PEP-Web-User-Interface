import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

import { LanguageCode, Languages } from 'pep/constants/lang';

export default class Admin extends Controller {
    languages = Languages;

    @tracked selectedLanguage?: LanguageCode;
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        admin: Admin;
    }
}
