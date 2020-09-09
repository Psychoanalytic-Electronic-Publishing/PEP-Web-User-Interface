import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import { reject } from 'rsvp';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import { Pagination } from '@gavant/ember-pagination/hooks/pagination';
import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';

import AuthService from 'pep/services/auth';
import LoadingBarService from 'pep/services/loading-bar';
import { buildSearchQueryParams } from 'pep/utils/search';
import {
    ViewPeriod,
    SEARCH_DEFAULT_VIEW_PERIOD,
    SEARCH_DEFAULT_PARAMS,
    SEARCH_DEFAULT_TERMS
} from 'pep/constants/search';
import Document from 'pep/pods/document/model';
import Session from 'pep/services/pep-session';

export default class ReadDocument extends Controller {
    @service session!: Session;
    @service auth!: AuthService;
    @service fastboot!: FastbootService;
    @service loadingBar!: LoadingBarService;
    @service router!: RouterService;

    defaultSearchParams = SEARCH_DEFAULT_PARAMS;

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    //@ts-ignore
    queryParams = [
        'q',
        { _searchTerms: 'searchTerms' },
        'matchSynonyms',
        'citedCount',
        'viewedCount',
        'viewedPeriod',
        { _facets: 'facets' }
    ];

    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;
    @tracked citedCount: string = '';
    @tracked viewedCount: string = '';
    @tracked viewedPeriod: ViewPeriod = SEARCH_DEFAULT_VIEW_PERIOD;
    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    @tracked _searchTerms: string | null = JSON.stringify(SEARCH_DEFAULT_TERMS);
    @tracked paginator!: Pagination<Document>;

    get isLoadingRoute(): boolean {
        return /loading$/.test(this.router.currentRouteName);
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

    get lastPage() {
        //TODO get from metadata
        return 5;
    }

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

    /**
     * Process query params
     *
     * @param {QueryParamsObj} params
     * @returns
     * @memberof ReadDocument
     */
    @action
    processQueryParams(params: QueryParamsObj) {
        const searchParams = buildSearchQueryParams(
            this.q,
            this.searchTerms,
            this.matchSynonyms,
            this.facets,
            this.citedCount,
            this.viewedCount,
            this.viewedPeriod
        );
        return { ...params, ...searchParams };
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
