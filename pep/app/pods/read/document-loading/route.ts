import Route from '@ember/routing/route';

import { PageNav } from 'pep/mixins/page-layout';

export default class ReadDocumentLoading extends PageNav(Route) {
    navController = 'read/document';
    get navTemplate() {
        return 'read/document/nav';
    }
}
