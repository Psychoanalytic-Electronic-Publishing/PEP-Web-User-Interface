import Route from '@ember/routing/route';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import AjaxService from 'pep/services/ajax';
import { PageNav } from 'pep/mixins/page-layout';
import { FIXTURE_SEARCH_RESULTS } from 'pep/constants/fixtures';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';
import { removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

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

        //workaround for https://github.com/emberjs/ember.js/issues/18981
        const params = this.paramsFor('read.document');
        const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
        const nonEmptyTerms = searchTerms.filter((t) => !!t.term);
        //if no search was submitted, don't fetch any results
        if (params.q || (Array.isArray(nonEmptyTerms) && nonEmptyTerms.length > 0)) {
            const queryParams = removeEmptyQueryParams({
                limit: 10,
                offset: 0,
                synonyms: params.matchSynonyms
            });
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
