import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import { LanguageCode } from 'pep/constants/lang';
import { PageNav, PageSidebar } from 'pep/mixins/page-layout';
import AdminController from 'pep/pods/admin/controller';

export default class Admin extends PageSidebar(PageNav(Route)) {
    navController = 'admin';

    setupController(controller: AdminController, model: object, transition: Transition) {
        super.setupController(controller, model, transition);
        const params = this.paramsFor('admin.language') as { lang_code: LanguageCode };
        controller.selectedLanguage = params.lang_code;
    }
}
