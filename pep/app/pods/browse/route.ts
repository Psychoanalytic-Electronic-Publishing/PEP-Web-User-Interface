import Route from '@ember/routing/route';
import { PageNav } from 'pep/mixins/page-layout';

export default class Browse extends PageNav(Route) {
    //TODO browse will have its own sidebar behavior/logic
    navController = 'application';
}
