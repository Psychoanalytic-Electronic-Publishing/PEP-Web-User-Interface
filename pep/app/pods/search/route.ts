import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
// import RoutePagination from '@gavant/ember-pagination/mixins/route-pagination';
import { PageNav } from 'pep/mixins/page-layout';
import AjaxService from 'pep/services/ajax';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';
import { FIXTURE_SEARCH_RESULTS } from 'pep/constants/fixtures';
import { buildSearchQueryParams } from 'pep/utils/search';

export default class Search extends PageNav(Route) {
    @service ajax!: AjaxService;

    navController = 'search';

    queryParams = {
        q: {
            replace: true
        },
        _searchTerms: {
            replace: true
        },
        matchSynonyms: {
            replace: true
        }
    };

    model(params) {
        //workaround for https://github.com/emberjs/ember.js/issues/18981
        const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
        const queryParams = buildSearchQueryParams(params.q, searchTerms, params.matchSynonyms);
        //if no search was submitted, don't fetch any results (will have at least 1 param for synonyms)
        if (Object.keys(queryParams).length > 1) {
            queryParams.offset = 0;
            queryParams.limit = 10;
            const queryStr = serializeQueryParams(queryParams);
            return this.ajax.request(`Database/Search?${queryStr}`);
        } else {
            return A();
        }
    }

    setupController(controller, model) {
        //TODO eventually RoutePagination will do this
        //TODO add matches dummy data for demo purposes
        const matches = FIXTURE_SEARCH_RESULTS[0].matches;
        const modelForController = model.documentList?.responseSet.map((r) => ({ ...r, matches })) ?? A();
        controller.modelName = 'document';
        controller.metadata = model.documentList?.responseInfo;
        controller.hasMore = modelForController.length >= controller.limit;

        //map the query params to current search values to populate the form
        controller.currentSmartSearchTerm = controller.q;
        controller.currentMatchSynonyms = controller.matchSynonyms;
        controller.currentSearchTerms = isEmpty(controller.searchTerms)
            ? [{ type: 'everywhere', term: '' }]
            : controller.searchTerms;

        super.setupController(controller, modelForController);
    }

    resetController(controller, isExiting, transition) {
        super.resetController(controller, isExiting, transition);
        controller.previewedResult = null;
        controller.previewIsExpanded = false;
    }
}
