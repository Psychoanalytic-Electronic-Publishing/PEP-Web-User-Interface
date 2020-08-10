import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
import SessionService from 'ember-simple-auth/services/session';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import ControllerPagination from '@gavant/ember-pagination/mixins/controller-pagination';
import { buildQueryParams, PaginationController } from '@gavant/ember-pagination/utils/query-params';

import AuthService from 'pep/services/auth';
import LoadingBarService from 'pep/services/loading-bar';
import { buildSearchQueryParams } from 'pep/utils/search';
import { SEARCH_DEFAULT_TERMS, SEARCH_DEFAULT_FACETS } from 'pep/constants/search';
import Document from 'pep/pods/document/model';

export default class ReadDocument extends ControllerPagination(Controller) {
    @service session!: SessionService;
    @service auth!: AuthService;
    @service fastboot!: FastbootService;
    @service loadingBar!: LoadingBarService;

    defaultSearchTerms = JSON.stringify(SEARCH_DEFAULT_TERMS);
    defaultSearchFacets = JSON.stringify(SEARCH_DEFAULT_FACETS);

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    queryParams = ['q', { _searchTerms: 'searchTerms' }, 'matchSynonyms', { _facets: 'facets' }];
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;

    //pagination config
    limit = 10;
    pagingRootKey = null;
    filterRootKey = null;

    @readOnly('searchResults.length') offset: number | undefined;

    @tracked currentPage = 1;
    @tracked searchResults: Document[] = [];
    @tracked metadata = {};

    get lastPage() {
        //TODO get from metadata
        return 5;
    }

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    @tracked _searchTerms: string | null = JSON.stringify([
        { type: 'everywhere', term: '' },
        { type: 'title', term: '' },
        { type: 'author', term: '' }
    ]);
    get searchTerms() {
        if (!this._searchTerms) {
            return [];
        } else {
            return JSON.parse(this._searchTerms);
        }
    }
    set searchTerms(array) {
        if (Array.isArray(array) && array.length > 0) {
            this._searchTerms = JSON.stringify(array);
        } else {
            this._searchTerms = null;
        }
    }

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    @tracked _facets: string | null = JSON.stringify([]);
    get facets() {
        if (!this._facets) {
            return [];
        } else {
            return JSON.parse(this._facets);
        }
    }
    set facets(array) {
        if (Array.isArray(array) && array.length > 0) {
            this._facets = JSON.stringify(array);
        } else {
            this._facets = null;
        }
    }

    /**
     * Loads the search results for the sidebar
     * @param {Boolean} reset
     */
    async _loadModels(reset: boolean) {
        this.set('isLoadingPage', true);
        if (reset) {
            this.clearModels();
        }

        const offset = this.offset;
        const limit = this.limit;
        //TODO this is pretty ugly, its a result of the pagination mixin issues
        const controller = (this as unknown) as PaginationController;
        const queryParams = buildQueryParams(controller, offset, limit);
        let models = [];

        try {
            const result = await this.fetchModels(queryParams);
            models = result.toArray();
            this.metadata = result.meta;
            this.hasMore = models.length >= limit;
            this.searchResults.pushObjects(models);
        } catch (errors) {
            reject(errors);
        }

        this.set('isLoadingPage', false);
        return models;
    }

    clearModels() {
        this.searchResults = [];
    }

    /**
     Run custom query params object generation before sending query request
     * @param {Object} params
     */
    fetchModels(params: object) {
        const searchQueryParams = buildSearchQueryParams(this.q, this.searchTerms, this.matchSynonyms, this.facets);
        const queryParams = { ...params, ...searchQueryParams };
        //@ts-ignore TODO pagination mixin issues
        return super.fetchModels(queryParams);
    }

    /**
     * Loads the next page of results
     */
    @action
    loadNextPage() {
        if (!this.isLoadingPage && this.hasMore) {
            //TODO this is pretty ugly, its a result of the pagination mixin issues
            const controller = (this as unknown) as PaginationController;
            return controller.loadMoreModels();
        }
    }

    /**
     * Opens the login modal dialog
     * @param {Event} event
     */
    @action
    login(event: Event) {
        event.preventDefault();
        return this.auth.openLoginModal(true, {
            actions: {
                onAuthenticated: this.onAuthenticated
            }
        });
    }

    /**
     * Reload the document now that the user is logged in
     */
    @action
    async onAuthenticated() {
        try {
            this.loadingBar.show();
            const model = await this.store.findRecord('document', this.model.id, { reload: true });
            set(this, 'model', model);
            this.loadingBar.hide();
            return model;
        } catch (err) {
            this.loadingBar.hide();
            return reject(err);
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        readDocument: ReadDocument;
    }
}
