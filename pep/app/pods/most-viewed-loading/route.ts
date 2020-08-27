import Route from '@ember/routing/route';
import { PageNav } from 'pep/mixins/page-layout';

export default class MostViewedLoading extends PageNav(Route) {
    navController = 'most-viewed';
    navTemplate = 'most-viewed/nav';
}
