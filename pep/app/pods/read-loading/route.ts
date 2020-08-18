import Route from '@ember/routing/route';

import { PageNav } from 'pep/mixins/page-layout';

export default class ReadLoading extends PageNav(Route) {
    navController = 'read';
    navTemplate = 'read/nav';
}
