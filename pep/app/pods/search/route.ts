import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { next } from '@ember/runloop';
import Transition from '@ember/routing/-private/transition';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { PageNav } from 'pep/mixins/page-layout';
import { buildSearchQueryParams } from 'pep/utils/search';
import SidebarService from 'pep/services/sidebar';
import SearchController from 'pep/pods/search/controller';
import Document from 'pep/pods/document/model';

export interface SearchParams {
    q: string;
    matchSynonyms: boolean;
    _searchTerms?: string;
    _facets?: string;
}

export default class Search extends PageNav(Route) {
    @service sidebar!: SidebarService;
    @service fastboot!: FastbootService;

    navController = 'search';

    queryParams = {
        q: {
            replace: true
        },
        _searchTerms: {
            replace: true
        },
        matchSynonyms: {
            replace: true
        },
        _facets: {
            replace: true
        }
    };

    /**
     * Fetches the search results
     * @param {SearchParams} params
     */
    model(params: SearchParams) {
        //workaround for https://github.com/emberjs/ember.js/issues/18981
        const searchTerms = params._searchTerms ? JSON.parse(params._searchTerms) : [];
        const facets = params._facets ? JSON.parse(params._facets) : [];

        const searchParams = buildSearchQueryParams(params.q, searchTerms, params.matchSynonyms, facets);
        //if no search was submitted, don't fetch any results (will have at least 2 params for synonyms and facetfields)
        if (Object.keys(searchParams).length > 2) {
            const controller = this.controllerFor(this.routeName);
            const queryParams = buildQueryParams({
                context: controller,
                pagingRootKey: null,
                filterRootKey: null,
                processQueryParams: (params) => ({ ...params, ...searchParams })
            });
            return this.store.query('document', queryParams);
        } else {
            return [];
        }
    }

    /**
     * if coming to the search page w/no search or results, make sure the search form is shown
     * @param {object} model
     * @param {Transition} transition
     */
    afterModel(model: object, transition: Transition) {
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
    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    setupController(controller: SearchController, model: RecordArrayWithMeta<Document>) {
        //map the query params to current search values to populate the form
        controller.currentSmartSearchTerm = controller.q;
        controller.currentMatchSynonyms = controller.matchSynonyms;
        controller.currentSearchTerms = isEmpty(controller.searchTerms)
            ? [{ type: 'everywhere', term: '' }]
            : controller.searchTerms;
        controller.currentFacets = controller.facets;

        controller.paginator = usePagination<Document>({
            context: controller,
            modelName: 'document',
            models: model.toArray(),
            metadata: model.meta,
            pagingRootKey: null,
            filterRootKey: null,
            processQueryParams: controller.processQueryParams
        });
        //workaround for bug w/array-based query param values
        //@see https://github.com/emberjs/ember.js/issues/18981
        //@ts-ignore
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
        //workaround for bug w/array-based query param values
        //@see https://github.com/emberjs/ember.js/issues/18981
        //@ts-ignore
        super.resetController(controller, isExiting, transition);
        controller.previewedResult = null;
        controller.previewMode = 'fit';
    }
}
