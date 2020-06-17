import Controller from '@ember/controller';
import { action } from '@ember/object';
import { readOnly } from '@ember/object/computed';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
import ControllerPagination from '@gavant/ember-pagination/mixins/controller-pagination';
import AjaxService from 'pep/services/ajax';
import { removeEmptyQueryParams, buildQueryParams } from '@gavant/ember-pagination/utils/query-params';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';
import { FIXTURE_SEARCH_RESULTS } from 'pep/constants/fixtures';
import { buildSearchQueryParams } from 'pep/utils/search';

export default class ReadDocument extends ControllerPagination(Controller) {
    @service ajax!: AjaxService;

    queryParams = ['q', { _searchTerms: 'searchTerms' }, 'matchSynonyms'];
    @tracked q: string = '';
    @tracked matchSynonyms: boolean = false;

    //pagination config
    limit = 10;
    pagingRootKey = null;
    filterRootKey = null;

    @readOnly('searchResults.length') offset: number | undefined;

    @tracked searchResults = [];
    //TODO will be removed once proper pagination is hooked up
    @tracked metadata = {};

    //workaround for bug w/array-based query param values
    //@see https://github.com/emberjs/ember.js/issues/18981
    @tracked _searchTerms = JSON.stringify([
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

    async _loadModels(reset: boolean) {
        this.set('isLoadingPage', true);
        if (reset) {
            this.clearModels();
        }

        const offset = this.offset;
        const limit = this.limit;
        const queryParams = buildQueryParams(this, offset, limit);
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

    //TODO TBD - overrides ControllerPagination, will not be needed once api is integrated w/ember-data
    async fetchModels(params) {
        const searchQueryParams = buildSearchQueryParams(this.q, this.searchTerms, this.matchSynonyms);
        const queryParams = { ...params, ...searchQueryParams };
        const queryStr = serializeQueryParams(queryParams);
        const result = await this.ajax.request(`Database/Search?${queryStr}`);
        //TODO add matches dummy data for demo purposes
        const matches = FIXTURE_SEARCH_RESULTS[0].matches;
        const results = result.documentList.responseSet.map((r) => ({ ...r, matches }));
        return {
            toArray: () => results,
            data: results,
            meta: result.documentList.responseInfo
        };
    }

    @action
    loadNextPage() {
        if (!this.isLoadingPage && this.hasMore) {
            return this.loadMoreModels();
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        readDocument: ReadDocument;
    }
}
