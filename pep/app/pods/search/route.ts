import Route from '@ember/routing/route';
import { PageNav } from 'pep/mixins/page-layout';
import { later } from '@ember/runloop';
import { Promise } from 'rsvp';
// import RoutePagination from '@gavant/ember-pagination/mixins/route-pagination';

export default class Search extends PageNav(Route) {
    navController = 'search';

    model(params) {
        //if no search was submitted, don't fetch any results
        if (params.q || (Array.isArray(params.searchTerms) && params.searchTerms.length > 0)) {
            return new Promise((resolve) => {
                later(() => {
                    resolve([
                        {
                            id: 1,
                            title: 'This is a test result'
                        },
                        {
                            id: 2,
                            title: 'This is another test result'
                        },
                        {
                            id: 3,
                            title: 'This is a third test result'
                        }
                    ]);
                }, 1500);
            });
        } else {
            return [];
        }
    }

    setupController(controller, model) {
        super.setupController(controller, model);
        //TODO eventually RoutePagination will do this
        controller.metadata = { total: 20 };
        controller.modelName = 'publication';
        controller.hasMore = true;

        //map the query params to current search values to populate the form
        controller.currentSmartSearchTerm = controller.q;
        controller.currentSearchTerms = controller.searchTerms;
        controller.currentMatchSynonyms = controller.matchSynonyms;
    }
}
