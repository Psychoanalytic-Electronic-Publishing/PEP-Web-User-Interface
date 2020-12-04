import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams, QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import { WIDGET } from 'pep/constants/sidebar';
import { PageNav } from 'pep/mixins/page-layout';
import BrowseController, { BrowseTabs } from 'pep/pods/browse/controller';
import BrowseJournalVolumeController from 'pep/pods/browse/journal/volume/controller';
import Document from 'pep/pods/document/model';
import ReadDocumentController from 'pep/pods/read/document/controller';
import SearchDocument from 'pep/pods/search-document/model';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import SidebarService from 'pep/services/sidebar';
import { buildSearchQueryParams, copyToController, hasSearchQuery } from 'pep/utils/search';

export interface ReadDocumentParams {
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

export default class ReadDocument extends PageNav(Route) {
    @service configuration!: ConfigurationService;
    @service sidebar!: SidebarService;
    @service currentUser!: CurrentUserService;
    navController = 'read/document';

    searchResults?: Document[];
    searchResultsMeta?: any;
    searchParams?: ReadDocumentParams | QueryParamsObj;
    searchHasPaging = true;
    showBackButton = true;

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
        let pastParams;

        // if we are transitioning from either the search results page, or another read document page
        // attempt to pull in the existing documents models for the results list, instead of making
        // another search query request for the same data
        if (transition.from?.name === 'read.document' || transition.from?.name === 'search') {
            const controller = this.controllerFor(transition.from?.name) as ReadDocumentController;
            pastParams = this.paramsFor(transition.from?.name) as ReadDocumentParams;
            results = controller?.paginator?.models;
            resultsMeta = controller?.paginator?.metadata;
            this.searchHasPaging = true;
            this.showBackButton = true;
        } else if (transition.from?.name === 'browse.index' || transition.from?.name.includes('browse.book')) {
            const controller = this.controllerFor('browse') as BrowseController;
            const tab = controller.tab;
            if (tab === BrowseTabs.BOOKS || tab === BrowseTabs.VIDEOS) {
                const smartSearchTerm = model.id.split('.');
                const searchParams = buildSearchQueryParams({
                    smartSearchTerm: `${smartSearchTerm[0]}.${smartSearchTerm[1]}.*`
                });
                const controller = this.controllerFor(this.routeName) as ReadDocumentController;
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
                pastParams = queryParams;
                const response = (await this.store.query('search-document', queryParams)) as RecordArrayWithMeta<
                    SearchDocument
                >;
                results = response.toArray();
                resultsMeta = response.meta;
                this.searchHasPaging = true;
                this.showBackButton = false;
            }
        } else if (transition.from?.name === 'browse.journal.volume') {
            const controller = this.controllerFor(transition.from?.name) as BrowseJournalVolumeController;
            const readController = this.controllerFor(this.routeName) as ReadDocumentController;
            const queryParams = buildQueryParams({
                context: controller,
                pagingRootKey: null,
                filterRootKey: null,
                sorts:
                    readController.selectedView.id === readController.tableView
                        ? ['']
                        : [this.currentUser.preferences?.searchSortType.id ?? '']
            });
            pastParams = queryParams;
            results = controller.model;
            this.searchHasPaging = false;
            this.showBackButton = false;
        }

        if (!results) {
            const params = this.paramsFor('read.document') as ReadDocumentParams;
            pastParams = params;
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
                const controller = this.controllerFor(this.routeName) as ReadDocumentController;
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
                this.showBackButton = true;
            }
        } else if (results && !resultsMeta) {
            resultsMeta = { fullCount: results.length };
        }

        if (results && resultsMeta) {
            this.searchResults = results;
            this.searchResultsMeta = resultsMeta;
            this.searchParams = pastParams;
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
        copyToController(this.searchParams, controller);
        controller.paginator = usePagination<Document>({
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
        controller.showBackButton = this.showBackButton;
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
