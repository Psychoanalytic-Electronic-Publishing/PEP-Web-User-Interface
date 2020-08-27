import Route from '@ember/routing/route';
import { PageNav } from 'pep/mixins/page-layout';

export default class MostCitedLoading extends PageNav(Route) {
    navController = 'most-cited';
    navTemplate = 'most-cited/nav';
}
