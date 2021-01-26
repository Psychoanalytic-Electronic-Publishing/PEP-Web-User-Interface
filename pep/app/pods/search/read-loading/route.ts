import Route from '@ember/routing/route';

import { PageNav } from 'pep/mixins/page-layout';

export default class SearchReadLoading extends PageNav(Route) {
    navController = 'search.read';
    get navTemplate() {
        return 'search/read/nav';
    }
}
