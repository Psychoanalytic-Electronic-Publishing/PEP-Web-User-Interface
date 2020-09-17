import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import Transition from '@ember/routing/-private/transition';
import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { PageNav } from 'pep/mixins/page-layout';
import { buildSearchQueryParams, hasSearchQuery } from 'pep/utils/search';
import Document from 'pep/pods/document/model';
import ReadDocumentController from 'pep/pods/read/document/controller';
import ConfigurationService from 'pep/services/configuration';
import { WIDGET } from 'pep/constants/sidebar';
import SidebarService from 'pep/services/sidebar';

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
    @service configuration!: ConfigurationService;
    @service sidebar!: SidebarService;
    navController = 'read/document';

    searchResults?: Document[];
    searchResultsMeta?: any;

    /**
     * Fetch the requested document
     * @param {ReadDocumentParams} params
     */
    model(params: ReadDocumentParams) {
        return this.store.findRecord('document', params.document_id, {
            reload: true
        });
    }

    /**
     * Fetch the search results for the document sidebar
     * @param {Object} model
     * @param {Transition} transition
     */
    async afterModel(model: Document, transition: Transition) {
        super.afterModel(model, transition);

        this.sidebar.update({
            [WIDGET.RELATED_DOCUMENTS]: model,
            [WIDGET.MORE_LIKE_THESE]: model,
            [WIDGET.GLOSSARY_TERMS]: model?.meta?.facetCounts.facet_fields.glossary_group_terms,
            [WIDGET.PUBLISHER_INFO]: model
        });

        let results;
        let resultsMeta;

        // if we are transitioning from either the search results page, or another read document page
        // attempt to pull in the existing documents models for the results list, instead of making
        // another search query request for the same data
        if (transition.from?.name === 'read.document' || transition.from?.name === 'search') {
            const controller = this.controllerFor(transition.from?.name) as ReadDocumentController;
            results = controller?.paginator?.models;
            resultsMeta = controller?.paginator?.metadata;
        }

        if (!results) {
            const params = this.paramsFor('read.document') as ReadDocumentParams;
            //workaround for https://github.com/emberjs/ember.js/issues/18981
            const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
            const facets = params._facets ? JSON.parse(params._facets) : [];
            const cfg = this.configuration.base.search;
            const searchParams = buildSearchQueryParams(
                params.q,
                searchTerms,
                params.matchSynonyms,
                facets,
                params.citedCount,
                params.viewedCount,
                params.viewedPeriod,
                cfg.facets.defaultFields,
                'AND',
                cfg.facets.valueLimit,
                cfg.facets.valueMinCount
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

                const res = (await this.store.query('document', queryParams)) as RecordArrayWithMeta<Document>;
                results = res.toArray();
                resultsMeta = res.meta;
            }
        }

        if (results && resultsMeta) {
            this.searchResults = results;
            this.searchResultsMeta = resultsMeta;
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
            models: this.searchResults ?? [],
            metadata: this.searchResultsMeta,
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
