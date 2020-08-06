import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import Transition from '@ember/routing/-private/transition';
import AjaxService from 'pep/services/ajax';
import { PageNav } from 'pep/mixins/page-layout';
import { buildSearchQueryParams } from 'pep/utils/search';
import Document from 'pep/pods/document/model';
import { FulfilledPagingQuery } from '@gavant/ember-pagination/mixins/controller-pagination';
import { RoutePagination } from '@gavant/ember-pagination/mixins/route-pagination';
import ReadDocumentController from './controller';
export interface ReadDocumentParams {
    document_id: string;
    q: string;
    matchSynonyms: boolean;
    _searchTerms?: string;
    _facets?: string;
}

export default class ReadDocument extends RoutePagination(PageNav(Route)) {
    @service ajax!: AjaxService;

    navController = 'read/document';
    searchResults: FulfilledPagingQuery<Document> | null = null;

    /**
     * Fetch the requested document
     * @param {ReadDocumentParams} params
     */
    model(params: ReadDocumentParams) {
        return this.store.findRecord('document', params.document_id, { reload: true });
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
            const results = await this.store.query('document', queryParams);
            this.searchResults = results;
        }
    }

    /**
     * Set the search results data on the controller
     * @param {ReadDocumentController} controller
     * @param {object} model
     */
    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    setupController(controller: ReadDocumentController, model: Document) {
        //workaround for bug w/array-based query param values
        //@see https://github.com/emberjs/ember.js/issues/18981
        //@ts-ignore
        super.setupController(controller, model);
        controller.modelName = 'document';
        controller.metadata = this.searchResults?.meta ?? {};
        controller.searchResults = this.searchResults?.toArray() ?? [];
        controller.hasMore = (controller.searchResults.length ?? 0) >= controller.limit;
    }

    /**
     * Clear any existing search results data when leaving the page
     * @param {ReadDocumentController} controller
     * @param {boolean} isExiting
     * @param {Transition} transition
     */
    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    resetController(controller: ReadDocumentController, isExiting: boolean, transition: Transition) {
        //workaround for bug w/array-based query param values
        //@see https://github.com/emberjs/ember.js/issues/18981
        //@ts-ignore
        super.resetController(controller, isExiting, transition);

        controller.searchResults = [];
        controller.metadata = {};
        controller.hasMore = false;
        this.searchResults = null;
    }
}
