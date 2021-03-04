import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import { LanguageCode } from 'pep/constants/lang';
import { PageNav, PageSidebar } from 'pep/mixins/page-layout';
import AdminController from 'pep/pods/admin/controller';
import { canAccessRoute } from 'pep/utils/user';

export default class Admin extends PageSidebar(PageNav(Route)) {
    navController = 'admin';

    /**
     * Check and see if the user can access this route, and if not forward them to the 403 page
     *
     * @memberof Admin
     */
    beforeModel(): void {
        const access = canAccessRoute(this, ['user.viewAdmin']);
        if (!access) {
            this.transitionTo('four-oh-three');
        }
    }

    setupController(controller: AdminController, model: object, transition: Transition): void {
        super.setupController(controller, model, transition);
        const params = this.paramsFor('admin.language') as { lang_code: LanguageCode };
        controller.selectedLanguage = params.lang_code;
    }
}
