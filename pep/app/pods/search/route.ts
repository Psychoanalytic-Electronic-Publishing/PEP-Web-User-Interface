import Route from '@ember/routing/route';
import { PageNav } from 'pep/mixins/page-layout';
import { later } from '@ember/runloop';
import { Promise } from 'rsvp';

export default class Search extends PageNav(Route) {
    navController = 'search';

    queryParams = {
        smartSearchTerm: {
            refreshModel: true
        },
        searchTerms: {
            refreshModel: true
        },
        matchSynonyms: {
            refreshModel: true
        }
    };

    model(params) {
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
            }, 2500);
        });
    }

    setupController(controller, model) {
        super.setupController(controller, model);
        const params = this.paramsFor('search');
        controller.currentSmartSearchTerm = params.smartSearchTerm;
        controller.currentSearchTerms = params.searchTerms;
        controller.currentMatchSynonyms = params.matchSynonyms;
    }
}
