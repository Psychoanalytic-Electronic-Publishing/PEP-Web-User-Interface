import Route from '@ember/routing/route';
import { PageNav } from 'pep/mixins/page-layout';

export default class ReadResourceLoading extends PageNav(Route) {
    navController = 'read/resource';
    navTemplate = 'read/resource/nav';
}
