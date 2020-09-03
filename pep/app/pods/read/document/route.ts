import Route from '@ember/routing/route';
import Transition from '@ember/routing/-private/transition';
import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { PageNav } from 'pep/mixins/page-layout';
import { buildSearchQueryParams, hasSearchQuery } from 'pep/utils/search';
import Document from 'pep/pods/document/model';
import ReadDocumentController from 'pep/pods/read/document/controller';

export interface ReadDocumentParams {
    document_id: string;
    q: string;
    matchSynonyms: boolean;
    citedCount?: string;
    viewedCount?: string;
    viewedPeriod?: number;
    _searchTerms?: string;
    _facets?: string;
}

export default class ReadDocument extends PageNav(Route) {
    navController = 'read/document';
    sidebarController = 'read/document';
    searchResults?: RecordArrayWithMeta<Document>;

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

        const searchParams = buildSearchQueryParams(
            params.q,
            searchTerms,
            params.matchSynonyms,
            facets,
            params.citedCount,
            params.viewedCount,
            params.viewedPeriod
        );
        //if no search was submitted, don't fetch any results
        if (hasSearchQuery(searchParams)) {
            const controller = this.controllerFor(this.routeName);
            const queryParams = buildQueryParams({
                context: controller,
                pagingRootKey: null,
                filterRootKey: null,
                processQueryParams: (params) => ({ ...params, ...searchParams })
            });

            const results = (await this.store.query('document', queryParams)) as RecordArrayWithMeta<Document>;
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
    setupController(controller: ReadDocumentController, model: RecordArrayWithMeta<Document>) {
        //workaround for bug w/array-based query param values
        //@see https://github.com/emberjs/ember.js/issues/18981
        //@ts-ignore
        super.setupController(controller, model);
        controller.paginator = usePagination<Document>({
            context: controller,
            modelName: 'document',
            models: this.searchResults?.toArray() ?? [],
            metadata: this.searchResults?.meta,
            pagingRootKey: null,
            filterRootKey: null,
            processQueryParams: controller.processQueryParams
        });
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
        this.searchResults = undefined;
    }
}
