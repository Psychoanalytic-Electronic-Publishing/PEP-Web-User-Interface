import Route from '@ember/routing/route';

import { PageNav } from 'pep/mixins/page-layout';

export default class MostViewedLoading extends PageNav(Route) {
    navController = 'most-viewed';
    get navTemplate() {
        return 'most-viewed/nav';
    }
}
