import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { reject } from 'rsvp';
import ControllerPagination from '@gavant/ember-pagination/mixins/controller-pagination';
import { buildQueryParams, PaginationController } from '@gavant/ember-pagination/utils/query-params';
import SessionService from 'ember-simple-auth/services/session';
import AjaxService from 'pep/services/ajax';
import AuthService from 'pep/services/auth';
import LoadingBarService from 'pep/services/loading-bar';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';
import { buildSearchQueryParams } from 'pep/utils/search';
import { SEARCH_DEFAULT_TERMS, SEARCH_DEFAULT_FACETS } from 'pep/constants/search';

const HTML_BODY_REGEX = /^.*?<body[^>]*>(.*?)<\/body>.*?$/i;

export default class ReadDocument extends ControllerPagination(Controller) {
    @service session!: SessionService;
    @service ajax!: AjaxService;
    @service auth!: AuthService;
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
    //@ts-ignore TODO null is allowed by the ember-pagination addon, we need to update the type there
    pagingRootKey = null;
    //@ts-ignore TODO null is allowed by the ember-pagination addon, we need to update the type there
    filterRootKey = null;

    @readOnly('searchResults.length') offset: number | undefined;

    @tracked currentPage = 1;
    @tracked searchResults: Array<any> = [];

    //TODO will be removed once proper pagination is hooked up
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

    get documentCleaned() {
        const document = !isEmpty(this.model.document) ? this.model.document : '';
        return document.replace(HTML_BODY_REGEX, '$1');
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
        //TODO this is pretty ugly, its a result of the mixin issues
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
     * TODO TBD - overrides ControllerPagination, will not be needed once api is integrated w/ember-data
     * @param {Object} params
     */
    async fetchModels(params: object) {
        const searchQueryParams = buildSearchQueryParams(this.q, this.searchTerms, this.matchSynonyms, this.facets);
        const queryParams = { ...params, ...searchQueryParams };
        const queryStr = serializeQueryParams(queryParams);
        const result = await this.ajax.request(`Database/Search/?${queryStr}`);
        const results = result.documentList.responseSet;
        return {
            toArray: () => results,
            data: results,
            meta: result.documentList.responseInfo
        };
    }

    /**
     * Loads the next page of results
     */
    @action
    loadNextPage() {
        if (!this.isLoadingPage && this.hasMore) {
            //TODO this is pretty ugly, its a result of the mixin issues
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
            const result = await this.ajax.request(`Documents/Document/${this.model.documentID}/`);
            const model = result?.documents?.responseSet[0];
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
