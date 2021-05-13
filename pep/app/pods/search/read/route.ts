import { action } from '@ember/object';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import FastbootService from 'ember-cli-fastboot/services/fastboot';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams, QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import isEqual from 'lodash.isequal';
import { GlossaryWidgetLocation, WIDGET } from 'pep/constants/sidebar';
import { PageNav } from 'pep/mixins/page-layout';
import { ApiServerErrorResponse } from 'pep/pods/application/adapter';
import Document from 'pep/pods/document/model';
import SearchDocument from 'pep/pods/search-document/model';
import SearchReadController from 'pep/pods/search/read/controller';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService, { VIEW_DOCUMENT_FROM } from 'pep/services/current-user';
import ScrollableService from 'pep/services/scrollable';
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
    index?: string;
}

export default class SearchRead extends PageNav(Route) {
    @service configuration!: ConfigurationService;
    @service sidebar!: SidebarService;
    @service currentUser!: CurrentUserService;
    @service scrollable!: ScrollableService;
    @service fastboot!: FastbootService;

    navController = 'search.read';
    searchResults?: Document[];
    searchResultsMeta?: any;
    searchParams?: SearchReadParams | QueryParamsObj;

    queryParams = {
        page: {
            replace: true
        },
        index: {
            replace: true
        }
    };

    /**
     * Fetch the requested document
     * @param {ReadDocumentParams} params
     */
    model(params: SearchReadParams) {
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
            // facetFields: cfg.facets.defaultFields, From Neil - turn this off to make query shorter - and its not needed
            joinOp: 'AND',
            facetLimit: cfg.facets.valueLimit,
            facetMinCount: cfg.facets.valueMinCount,
            highlightlimit: this.currentUser.preferences?.searchHICLimit ?? cfg.hitsInContext.limit,
            smartSearchTerm: params.q
        });
        delete searchParams.abstract;
        // We now want to take this object and convert it to a browser query param string to send to the server (as that is what they are expecting)
        const queryString = serializeQueryParams(searchParams);
        const searchQueryString = encodeURIComponent(`?${queryString}`);
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
            [WIDGET.GLOSSARY_TERMS]: {
                terms: model?.meta?.facetCounts.facet_fields.glossary_group_terms,
                location: GlossaryWidgetLocation.READ
            },
            [WIDGET.PUBLISHER_INFO]: model
        });

        let results;
        let resultsMeta;
        const pastQueryParams = transition.from?.queryParams;
        const queryParams = transition.to?.queryParams;

        if (transition.from?.name) {
            const controller = this.controllerFor(transition.from.name) as SearchReadController;
            results = controller?.paginator?.models;
            resultsMeta = controller?.paginator?.metadata;
        }

        // if the query params are different - load new items, otherwise reuse if possible
        if (!pastQueryParams || !isEqual(pastQueryParams, queryParams)) {
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
                    limit: Number(params.index) + controller.pagingLimit,
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
    setupController(controller: SearchReadController, model: Document, transition: Transition) {
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
            limit: controller.pagingLimit
        });
        this.currentUser.lastViewedDocument = {
            id: model.id,
            from: VIEW_DOCUMENT_FROM.SEARCH
        };
        controller.searchHitNumber = undefined;
        controller.document = model;

        if (!this.fastboot.isFastBoot) {
            const page = transition.to.queryParams.page;
            const index = transition.to.queryParams.index;
            if (page) {
                controller.page = page;
            }
            if (index) {
                controller.index = Number(transition.to.queryParams.index);
            }
        }
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
        controller.page = null;
        this.searchResults = undefined;
        this.searchParams = undefined;
        this.sidebar.update({
            [WIDGET.RELATED_DOCUMENTS]: null,
            [WIDGET.MORE_LIKE_THESE]: null,
            [WIDGET.GLOSSARY_TERMS]: null,
            [WIDGET.PUBLISHER_INFO]: null
        });
    }

    /**
     * Top level route error event handler - If routes reject with an error
     * i.e. do not explicitly catch and handle errors return by their
     * model()/beforeModel()/afterModel() hooks, this will be invoked.
     * Which will redirect the user as needed, depending the type of error returned
     * @param {ApiServerErrorResponse} error
     */
    @action
    error(error?: ApiServerErrorResponse): boolean {
        if (this.fastboot.isFastBoot) {
            this.fastboot.response.statusCode = error?.errors?.[0]?.status ?? 200;
        }
        if (error?.errors?.length && error?.errors?.length > 0) {
            const status = error?.errors?.[0].status;
            if (status === '404') {
                this.replaceWith('four-oh-four-document', '404');
                //marks error as being handled
                return false;
            }
        }
        return true;
    }
}
