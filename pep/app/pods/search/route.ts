import Route from '@ember/routing/route';
import { later } from '@ember/runloop';
import { isEmpty } from '@ember/utils';
import { Promise } from 'rsvp';
// import RoutePagination from '@gavant/ember-pagination/mixins/route-pagination';
import { PageNav } from 'pep/mixins/page-layout';
import { FIXTURE_SEARCH_RESULTS } from 'pep/constants/fixtures';

export default class Search extends PageNav(Route) {
    navController = 'search';

    model(params) {
        //workaround for https://github.com/emberjs/ember.js/issues/18981
        const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
        //if no search was submitted, don't fetch any results
        if (params.q || (Array.isArray(searchTerms) && searchTerms.length > 0)) {
            return new Promise((resolve) => {
                later(() => {
                    resolve(FIXTURE_SEARCH_RESULTS);
                }, 1200);
            });
        } else {
            return [];
        }
    }

    setupController(controller, model) {
        super.setupController(controller, model);
        //TODO eventually RoutePagination will do this
        controller.metadata = { total: model.length };
        controller.modelName = 'publication';
        controller.hasMore = true;

        //map the query params to current search values to populate the form
        controller.currentSmartSearchTerm = controller.q;
        controller.currentMatchSynonyms = controller.matchSynonyms;
        controller.currentSearchTerms = isEmpty(controller.searchTerms)
            ? [{ type: 'everywhere', term: '' }]
            : controller.searchTerms;
    }
}
