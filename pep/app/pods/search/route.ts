import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';
import { next } from '@ember/runloop';
// import RoutePagination from '@gavant/ember-pagination/mixins/route-pagination';
import { PageNav } from 'pep/mixins/page-layout';
import AjaxService from 'pep/services/ajax';
import { inject as service } from '@ember/service';
import { A } from '@ember/array';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';
import { buildSearchQueryParams } from 'pep/utils/search';
import Sidebar from 'pep/services/sidebar';

export default class Search extends PageNav(Route) {
    @service ajax!: AjaxService;
    @service sidebar!: Sidebar;

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
        },
        _facets: {
            replace: true
        }
    };

    model(params) {
        //workaround for https://github.com/emberjs/ember.js/issues/18981
        const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
        const facets = params._facets ? JSON.parse(params._facets) : [];

        const queryParams = buildSearchQueryParams(params.q, searchTerms, params.matchSynonyms, facets);
        //if no search was submitted, don't fetch any results (will have at least 2 params for synonyms and facetfields)
        if (Object.keys(queryParams).length > 2) {
            queryParams.offset = 0;
            queryParams.limit = 10;
            const queryStr = serializeQueryParams(queryParams);
            return this.ajax.request(`Database/Search?${queryStr}`);
        } else {
            return A();
        }
    }

    afterModel(model, transition) {
        //if coming to the search page w/no search or results, make sure the search form is shown
        if (isEmpty(model)) {
            next(this, () => this.sidebar.toggleLeftSidebar(true));
        }

        return super.afterModel(model, transition);
    }

    setupController(controller, model) {
        //TODO eventually RoutePagination will do this
        const modelForController = model.documentList?.responseSet ?? A();
        controller.modelName = 'document';
        controller.metadata = model.documentList?.responseInfo;
        controller.hasMore = modelForController.length >= controller.limit;

        //map the query params to current search values to populate the form
        controller.currentSmartSearchTerm = controller.q;
        controller.currentMatchSynonyms = controller.matchSynonyms;
        controller.currentSearchTerms = isEmpty(controller.searchTerms)
            ? [{ type: 'everywhere', term: '' }]
            : controller.searchTerms;
        controller.currentFacets = controller.facets;

        super.setupController(controller, modelForController);
    }

    resetController(controller, isExiting, transition) {
        super.resetController(controller, isExiting, transition);
        controller.previewedResult = null;
        controller.previewMode = 'fit';
    }
}
