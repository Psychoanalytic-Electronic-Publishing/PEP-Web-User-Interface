import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

import FastbootService from 'ember-cli-fastboot/services/fastboot';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { SearchMetadata } from 'pep/api';
import { GlossaryWidgetLocation, WIDGET } from 'pep/constants/sidebar';
import { PageNav } from 'pep/mixins/page-layout';
import Document from 'pep/pods/document/model';
import SearchController from 'pep/pods/search/index/controller';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import SidebarService from 'pep/services/sidebar';
import { buildSearchQueryParams, hasSearchQuery } from 'pep/utils/search';

export interface SearchIndexParams {
    q?: string;
    matchSynonyms?: boolean;
    preview?: string;
    citedCount?: string;
    viewedCount?: string;
    viewedPeriod?: number;
    _searchTerms?: string;
    _facets?: string;
}

export interface SearchQueryParams extends Omit<SearchIndexParams, '_searchTerms' | '_facets'> {
    searchTerms?: string;
    facets?: string;
}

export default class SearchIndex extends PageNav(Route) {
    @service sidebar!: SidebarService;
    @service fastboot!: FastbootService;
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;

    navController = 'search.index';
    resultsMeta: SearchMetadata | null = null;
    preview?: Document;

    queryParams = {
        q: {
            replace: true
        },
        _searchTerms: {
            replace: true
        },
        preview: {
            replace: false
        },
        matchSynonyms: {
            replace: true
        },
        citedCount: {
            replace: true
        },
        viewedCount: {
            replace: true
        },
        viewedPeriod: {
            replace: true
        },
        _facets: {
            replace: true
        }
    };

    /**
     * Fetches the search results
     * @param {SearchIndexParams} params
     */
    model(params: SearchIndexParams) {
        const searchParams = this.buildQueryParams(params);
        // if no search was submitted, don't fetch any results
        if (hasSearchQuery(searchParams)) {
            const controller = this.controllerFor(this.routeName) as SearchController;
            const queryParams = buildQueryParams({
                context: controller,
                pagingRootKey: null,
                filterRootKey: null,
                sorts:
                    controller.selectedView.id === controller.tableView
                        ? ['']
                        : [this.currentUser.preferences?.searchSortType.id ?? ''],
                processQueryParams: (params) => ({ ...params, ...searchParams, user: true })
            });
            return this.store.query('search-document', queryParams);
        } else {
            return [];
        }
    }

    /**
     * if coming to the search page w/no search or results, make sure the search form is shown
     * @param {object} model
     * @param {Transition} transition
     */
    async afterModel(model: object, transition: Transition) {
        const params = this.paramsFor(this.routeName) as SearchIndexParams;
        const searchParams = this.buildQueryParams(params, false);

        // if a search was submitted, do a 2nd query to get the metadata/facet counts w/o any facet values applied
        if (hasSearchQuery(searchParams)) {
            const result = await this.store.query('search-document', { ...searchParams, offset: 0, limit: 1 });
            this.resultsMeta = result.meta as SearchMetadata;
        } else {
            this.resultsMeta = null;
        }

        if (params.preview) {
            const result = await this.store.findRecord('document', params.preview);
            this.preview = result;
        }

        if (isEmpty(model) && !this.fastboot.isFastBoot) {
            next(this, () => this.sidebar.toggleLeftSidebar(true));
        }

        return super.afterModel(model, transition);
    }

    /**
     * Sets the pagination data and search form data on the controller
     * @param {SearchController} controller
     * @param {Document} model
     */
    // workaround for bug w/array-based query param values
    // @see https://github.com/emberjs/ember.js/issues/18981
    // @ts-ignore
    setupController(controller: SearchController, model: RecordArrayWithMeta<Document>) {
        const cfg = this.configuration.base.search;
        const prefs = this.currentUser.preferences;
        const terms =
            (prefs?.userSearchFormSticky ? prefs?.searchTermFields : cfg.terms.defaultFields) ??
            cfg.terms.defaultFields;
        const isLimitOpen =
            (prefs?.userSearchFormSticky ? prefs?.searchLimitIsShown : cfg.limitFields.isShown) ??
            cfg.limitFields.isShown;

        //map the query params to current search values to populate the form
        controller.currentSmartSearchTerm = controller.q;
        controller.currentMatchSynonyms = controller.matchSynonyms;
        controller.currentCitedCount = controller.citedCount;
        controller.currentViewedCount = controller.viewedCount;
        controller.currentViewedPeriod = controller.viewedPeriod;
        controller.currentSearchTerms = isEmpty(controller.searchTerms)
            ? terms.map((f) => ({ type: f, term: '' }))
            : controller.searchTerms;
        controller.currentFacets = controller.facets;

        // pass the search result meta data into the controller
        controller.resultsMeta = this.resultsMeta;

        //set the preview pane
        controller.previewedResult = this.preview;

        // open the search form's limit fields section if it has values
        // or the admin configs or user's prefs default it to open
        if (controller.currentCitedCount || controller.currentViewedCount || isLimitOpen) {
            controller.isLimitOpen = true;
        }

        controller.paginator = usePagination<Document>({
            context: controller,
            modelName: 'search-document',
            models: model.toArray(),
            metadata: model.meta,
            pagingRootKey: null,
            filterRootKey: null,
            sorts:
                controller.selectedView.id === controller.tableView
                    ? ['']
                    : [this.currentUser.preferences?.searchSortType.id ?? ''],
            processQueryParams: controller.processQueryParams,
            onChangeSorting: controller.onChangeSorting
        });

        this.sidebar.update({
            [WIDGET.RELATED_DOCUMENTS]: undefined,
            [WIDGET.MORE_LIKE_THESE]: undefined,
            [WIDGET.WHO_CITED_THIS]: undefined,
            [WIDGET.GLOSSARY_TERMS]: {
                terms: this.resultsMeta?.facetCounts.facet_fields.glossary_group_terms,
                location: GlossaryWidgetLocation.SEARCH
            }
        });

        // workaround for bug w/array-based query param values
        // @see https://github.com/emberjs/ember.js/issues/18981
        // @ts-ignore
        super.setupController(controller, model);
    }

    /**
     * Clears any currently previewed result when leaving the page
     * @param {SearchController} controller
     * @param {Boolean} isExiting
     * @param {Transition} transition
     */
    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    resetController(controller: SearchController, isExiting: boolean, transition: Transition) {
        // workaround for bug w/array-based query param values
        // @see https://github.com/emberjs/ember.js/issues/18981
        // @ts-ignore
        super.resetController(controller, isExiting, transition);
        controller.previewedResult = null;
        controller.preview = null;

        // clear current results meta data
        controller.resultsMeta = null;
        // reset the search form limit fields section
        const cfg = this.configuration.base.search;
        const prefs = this.currentUser.preferences;

        controller.isLimitOpen =
            (prefs?.userSearchFormSticky ? prefs?.searchLimitIsShown : cfg.limitFields.isShown) ??
            cfg.limitFields.isShown;
    }

    /**
     * Creates the query params object for document search requests
     * @param {SearchParams} params
     * @param {boolean} [includeFacets=true]
     * @returns {QueryParamsObj}
     */
    buildQueryParams(params: SearchIndexParams, includeFacets: boolean = true) {
        const cfg = this.configuration.base.search;
        // workaround for https://github.com/emberjs/ember.js/issues/18981
        const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
        const facets = params._facets && includeFacets ? JSON.parse(params._facets) : [];
        return buildSearchQueryParams({
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
    }
}
