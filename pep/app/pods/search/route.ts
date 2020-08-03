import Route from '@ember/routing/route';
import Controller from '@ember/controller';
import { isEmpty } from '@ember/utils';
import { next } from '@ember/runloop';
import Transition from '@ember/routing/-private/transition';
import RoutePagination from '@gavant/ember-pagination/mixins/route-pagination';
import { PageNav } from 'pep/mixins/page-layout';
import { inject as service } from '@ember/service';
import { buildSearchQueryParams } from 'pep/utils/search';
import Sidebar from 'pep/services/sidebar';
import SearchController from './controller';
import { PaginationController } from '@gavant/ember-pagination/utils/query-params';
import Document from 'pep/pods/document/model';

export interface SearchParams {
    q: string;
    matchSynonyms: boolean;
    _searchTerms?: string;
    _facets?: string;
}

export default class Search extends PageNav(RoutePagination(Route)) {
    @service sidebar!: Sidebar;

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

        const queryParams = buildSearchQueryParams(params.q, searchTerms, params.matchSynonyms, facets);
        //if no search was submitted, don't fetch any results (will have at least 2 params for synonyms and facetfields)
        if (Object.keys(queryParams).length > 2) {
            queryParams.offset = 0;
            queryParams.limit = 10;
            return this.store.query('document', queryParams);
        } else {
            //so that RoutePagination will continue to work, just unload any cached documents
            //and return an empty documents RecordArray by peeking at the now empty store cache
            this.store.unloadAll('document');
            return this.store.peekAll('document');
        }
    }

    /**
     * if coming to the search page w/no search or results, make sure the search form is shown
     * @param {object} model
     * @param {Transition} transition
     */
    afterModel(model: object, transition: Transition) {
        if (isEmpty(model)) {
            next(this, () => this.sidebar.toggleLeftSidebar(true));
        }

        return super.afterModel(model, transition);
    }

    /**
     * Sets the pagination data and search form data on the controller
     * @param {SearchController} controller
     * @param {Document} model
     */
    //@ts-ignore TODO mixin issues
    setupController(controller: SearchController, model: Document[]) {
        //TODO this is pretty ugly, its a result of the pagination mixin issues
        const ctrlr = (controller as unknown) as Controller;
        const paginationCtrlr = (ctrlr as unknown) as PaginationController;
        //map the query params to current search values to populate the form
        paginationCtrlr.currentSmartSearchTerm = controller.q;
        paginationCtrlr.currentMatchSynonyms = controller.matchSynonyms;
        paginationCtrlr.currentSearchTerms = isEmpty(controller.searchTerms)
            ? [{ type: 'everywhere', term: '' }]
            : controller.searchTerms;
        paginationCtrlr.currentFacets = controller.facets;

        super.setupController(ctrlr, model);
    }

    /**
     * Clears any currently previewed result when leaving the page
     * @param {SearchController} controller
     * @param {Boolean} isExiting
     * @param {Transition} transition
     */
    //@ts-ignore TODO pagination mixin issues
    resetController(controller: SearchController, isExiting: boolean, transition: Transition) {
        //TODO this is pretty ugly, its a result of the pagination mixin issues
        const ctrlr = (controller as unknown) as Controller;
        super.resetController(ctrlr, isExiting, transition);
        controller.previewedResult = null;
        controller.previewMode = 'fit';
    }
}
