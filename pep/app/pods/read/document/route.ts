import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import AjaxService from 'pep/services/ajax';
import { PageNav } from 'pep/mixins/page-layout';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';
import { buildSearchQueryParams } from 'pep/utils/search';

export default class ReadDocument extends PageNav(Route) {
    @service ajax!: AjaxService;

    navController = 'read/document';
    searchResults = null;

    async model(params) {
        const result = await this.ajax.request(`Documents/Document/${params.document_id}`);
        return result?.documents?.responseSet[0];
    }

    async afterModel(model, transition) {
        super.afterModel(model, transition);

        const params = this.paramsFor('read.document');
        //workaround for https://github.com/emberjs/ember.js/issues/18981
        const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
        const facets = params._facets ? JSON.parse(params._facets) : [];

        const queryParams = buildSearchQueryParams(params.q, searchTerms, params.matchSynonyms, facets);
        //if no search was submitted, don't fetch any results (will have at least 2 params for synonyms and facetfields)
        if (Object.keys(queryParams).length > 2) {
            queryParams.offset = 0;
            queryParams.limit = 10;
            const queryStr = serializeQueryParams(queryParams);
            const results = await this.ajax.request(`Database/Search?${queryStr}`);
            this.searchResults = results;
        }
    }

    setupController(controller, model) {
        //TODO eventually RoutePagination will do this
        super.setupController(controller, model);

        controller.modelName = 'document';
        controller.metadata = this.searchResults?.documentList?.responseInfo ?? {};
        controller.searchResults = this.searchResults?.documentList?.responseSet ?? [];
        controller.hasMore = (this.searchResults?.documentList?.responseSet?.length ?? 0) >= controller.limit;
    }
}
