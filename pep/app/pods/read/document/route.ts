import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Transition from '@ember/routing/-private/transition';
import AjaxService from 'pep/services/ajax';
import { PageNav } from 'pep/mixins/page-layout';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';
import { buildSearchQueryParams } from 'pep/utils/search';
import ReadDocumentController from './controller';
import { SearchResults } from 'pep/pods/search/route';

export interface ReadDocumentParams {
    document_id: string;
    q: string;
    matchSynonyms: boolean;
    _searchTerms?: string;
    _facets?: string;
}

export default class ReadDocument extends PageNav(Route) {
    @service ajax!: AjaxService;

    navController = 'read/document';
    searchResults: SearchResults | null = null;

    /**
     * Fetch the requested document
     * @param {ReadDocumentParams} params
     */
    async model(params: ReadDocumentParams) {
        const result = await this.ajax.request(`Documents/Document/${params.document_id}/`);
        return result?.documents?.responseSet[0];
    }

    /**
     * Fetch the search results for the document sidebar
     * @param {Object} model
     * @param {Transition} transition
     */
    async afterModel(model: object, transition: Transition) {
        super.afterModel(model, transition);

        const params = this.paramsFor('read.document') as ReadDocumentParams;
        //workaround for https://github.com/emberjs/ember.js/issues/18981
        const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
        const facets = params._facets ? JSON.parse(params._facets) : [];

        const queryParams = buildSearchQueryParams(params.q, searchTerms, params.matchSynonyms, facets);
        //if no search was submitted, don't fetch any results (will have at least 2 params for synonyms and facetfields)
        if (Object.keys(queryParams).length > 2) {
            queryParams.offset = 0;
            queryParams.limit = 10;
            const queryStr = serializeQueryParams(queryParams);
            const results = await this.ajax.request(`Database/Search/?${queryStr}`);
            this.searchResults = results;
        }
    }

    /**
     * Set the search results data on the controller
     * @param {ReadDocumentController} controller
     * @param {object} model
     */
    //@ts-ignore TODO mixin issues
    setupController(controller: ReadDocumentController, model: object) {
        //@ts-ignore TODO mixin issues
        super.setupController(controller, model);
        //TODO eventually RoutePagination will do this
        controller.modelName = 'document';
        controller.metadata = this.searchResults?.documentList?.responseInfo ?? {};
        controller.searchResults = this.searchResults?.documentList?.responseSet ?? [];
        controller.hasMore = (this.searchResults?.documentList?.responseSet?.length ?? 0) >= controller.limit;
    }

    /**
     * Clear any existing search results data when leaving the page
     * @param {ReadDocumentController} controller
     * @param {boolean} isExiting
     * @param {Transition} transition
     */
    //@ts-ignore TODO mixin issues
    resetController(controller: ReadDocumentController, isExiting: boolean, transition: Transition) {
        //@ts-ignore TODO mixin issues
        super.resetController(controller, isExiting, transition);
        controller.searchResults = [];
        controller.metadata = {};
        controller.hasMore = false;
        this.searchResults = null;
    }
}
