import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import ArrayProxy from '@ember/array/proxy';
import Transition from '@ember/routing/-private/transition';

import AjaxService from 'pep/services/ajax';
import { PageNav } from 'pep/mixins/page-layout';
import { buildSearchQueryParams } from 'pep/utils/search';
import Document from 'pep/pods/document/model';
import ReadDocumentController from './controller';

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
    searchResults: ArrayProxy<Document> | null = null;

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
    //@ts-ignore TODO mixin issues
    setupController(controller: ReadDocumentController, model: Document) {
        //@ts-ignore TODO pagination mixin issues
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
    //@ts-ignore TODO pagination mixin issues
    resetController(controller: ReadDocumentController, isExiting: boolean, transition: Transition) {
        //@ts-ignore TODO pagination mixin issues
        super.resetController(controller, isExiting, transition);

        controller.searchResults = [];
        controller.metadata = {};
        controller.hasMore = false;
        this.searchResults = null;
    }
}
