import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams, QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import { WIDGET } from 'pep/constants/sidebar';
import { PageNav } from 'pep/mixins/page-layout';
import Document from 'pep/pods/document/model';
import SearchDocument from 'pep/pods/search-document/model';
import SearchReadController from 'pep/pods/search/read/controller';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService, { VIEW_DOCUMENT_FROM } from 'pep/services/current-user';
import SidebarService from 'pep/services/sidebar';
import { buildSearchQueryParams, copyToController, hasSearchQuery } from 'pep/utils/search';
import { serializeQueryParams } from 'pep/utils/url';

export interface SearchReadParams {
    document_id: string;
    q: string;
    matchSynonyms: boolean;
    citedCount?: string;
    viewedCount?: string;
    viewedPeriod?: number;
    _searchTerms?: string;
    _facets?: string;
    page?: string;
}

export default class SearchRead extends PageNav(Route) {
    @service configuration!: ConfigurationService;
    @service sidebar!: SidebarService;
    @service currentUser!: CurrentUserService;

    navController = 'search.read';
    searchResults?: Document[];
    searchResultsMeta?: any;
    searchParams?: SearchReadParams | QueryParamsObj;
    searchHasPaging = true;

    /**
     * Fetch the requested document
     * @param {ReadDocumentParams} params
     */
    model(params: SearchReadParams) {
        let searchQueryString;
        //workaround for https://github.com/emberjs/ember.js/issues/18981
        const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
        const facets = params._facets ? JSON.parse(params._facets) : [];
        const cfg = this.configuration.base.search;
        const searchParams = buildSearchQueryParams({
            searchTerms,
            synonyms: params.matchSynonyms,
            facetValues: facets,
            citedCount: params.citedCount,
            viewedCount: params.viewedCount,
            viewedPeriod: params.viewedPeriod,
            facetFields: cfg.facets.defaultFields,
            joinOp: 'AND',
            facetLimit: cfg.facets.valueLimit,
            facetMinCount: cfg.facets.valueMinCount,
            highlightlimit: this.currentUser.preferences?.searchHICLimit ?? cfg.hitsInContext.limit
        });
        // API wants us to use fulltext1 here, not smartText which is why we are adding it after
        searchParams.fulltext1 = params.q;
        delete searchParams.abstract;
        // We now want to take this object and convert it to a browser query param string to send to the server (as that is what they are expecting)
        let queryString = serializeQueryParams(searchParams);
        searchQueryString = encodeURIComponent(`?${queryString}`);
        const adapterOptions = searchQueryString
            ? {
                  searchQuery: `search='${searchQueryString}'`
              }
            : null;

        return this.store.findRecord('document', params.document_id, {
            reload: true,
            adapterOptions
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
        let pastQueryParams = transition.from?.queryParams;
        let queryParams = transition.to?.queryParams;

        if (transition.from?.name) {
            const controller = this.controllerFor(transition.from.name) as SearchReadController;
            results = controller?.paginator?.models;
            resultsMeta = controller?.paginator?.metadata;
            this.searchHasPaging = true;
        }

        // if the query params are different - load new items, otherwise reuse if possible
        if (!pastQueryParams || JSON.stringify(pastQueryParams) !== JSON.stringify(queryParams)) {
            const params = this.paramsFor('search.read') as SearchReadParams;
            //workaround for https://github.com/emberjs/ember.js/issues/18981
            const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
            const facets = params._facets ? JSON.parse(params._facets) : [];
            const cfg = this.configuration.base.search;
            const searchParams = buildSearchQueryParams({
                smartSearchTerm: params.q,
                searchTerms,
                synonyms: params.matchSynonyms,
                facetValues: facets,
                citedCount: params.citedCount,
                viewedCount: params.viewedCount,
                viewedPeriod: params.viewedPeriod,
                facetFields: cfg.facets.defaultFields,
                joinOp: 'AND',
                facetLimit: cfg.facets.valueLimit,
                facetMinCount: cfg.facets.valueMinCount,
                highlightlimit: this.currentUser.preferences?.searchHICLimit ?? cfg.hitsInContext.limit
            });

            //if no search was submitted, don't fetch any results
            if (hasSearchQuery(searchParams)) {
                const controller = this.controllerFor(this.routeName) as SearchReadController;
                const queryParams = buildQueryParams({
                    context: controller,
                    pagingRootKey: null,
                    filterRootKey: null,
                    sorts:
                        controller.selectedView.id === controller.tableView
                            ? ['']
                            : [this.currentUser.preferences?.searchSortType.id ?? ''],
                    processQueryParams: (params) => ({ ...params, ...searchParams })
                });

                const response = (await this.store.query('search-document', queryParams)) as RecordArrayWithMeta<
                    SearchDocument
                >;
                results = response.toArray();
                resultsMeta = response.meta;
                this.searchHasPaging = true;
            }
        }

        if (results && !resultsMeta) {
            resultsMeta = { fullCount: results.length };
        }

        if (results && resultsMeta) {
            this.searchResults = results;
            this.searchResultsMeta = resultsMeta;

            const searchParams = pastQueryParams ?? {};
            // If either search terms or facets exists, parse the json as they are coming from the query params
            if (pastQueryParams?.searchTerms) {
                searchParams.searchTerms = JSON.parse(pastQueryParams.searchTerms);
            }
            if (pastQueryParams?.facets) {
                searchParams.facets = JSON.parse(pastQueryParams.facets);
            }

            this.searchParams = searchParams;
        }
    }

    /**
     * Set the search results data on the controller
     * @param {SearchReadController} controller
     * @param {object} model
     */
    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    setupController(controller: SearchReadController, model: RecordArrayWithMeta<Document>) {
        //workaround for bug w/array-based query param values
        //@see https://github.com/emberjs/ember.js/issues/18981
        //@ts-ignore
        super.setupController(controller, model);

        copyToController(this.searchParams, controller);
        controller.paginator = usePagination<Document, any>({
            context: controller,
            modelName: 'search-document',
            models: this.searchResults ?? [],
            metadata: this.searchResultsMeta,
            sorts:
                controller.selectedView.id === controller.tableView
                    ? ['']
                    : [this.currentUser.preferences?.searchSortType.id ?? ''],
            pagingRootKey: null,
            filterRootKey: null,
            processQueryParams: controller.processQueryParams,
            onChangeSorting: controller.onChangeSorting,
            limit: this.searchHasPaging ? 20 : 1000
        });
        this.currentUser.lastViewedDocumentId = model.id;
        this.currentUser.lastViewedDocumentFrom = VIEW_DOCUMENT_FROM.SEARCH;
        controller.searchHitNumber = undefined;
    }

    /**
     * Clear any existing search results data when leaving the page
     * @param {SearchReadController} controller
     * @param {boolean} isExiting
     * @param {Transition} transition
     */
    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    resetController(controller: SearchReadController, isExiting: boolean, transition: Transition) {
        //workaround for bug w/array-based query param values
        //@see https://github.com/emberjs/ember.js/issues/18981
        //@ts-ignore
        super.resetController(controller, isExiting, transition);
        this.searchResults = undefined;
        this.searchParams = undefined;
    }
}
