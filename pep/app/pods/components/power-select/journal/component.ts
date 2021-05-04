import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import { didCancel } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import DS from 'ember-data';

import { removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { dontRunInFastboot } from 'pep/decorators/fastboot';
import PowerSelectInfinityWithSearch from 'pep/pods/components/power-select-infinity/with-search/component';
import Journal from 'pep/pods/journal/model';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface JournalParams {
    limit: number | null;
    offset: number | null;
    sourcename?: any;
}

export default class PowerSelectJournal extends Component<
    BaseGlimmerSignature<PowerSelectInfinityWithSearch<Journal>>
> {
    @service store!: DS.Store;

    @tracked options!: Journal[];
    @tracked canLoadMore: boolean = true;
    @tracked pageSize: number = 20;

    /**
     * Queries the server for `journals` using the passed in
     * keyword.
     *
     * @param {string} keyword
     * @param {number} offset
     * @returns Journal[]
     */
    @restartableTask
    *load(keyword?: string, offset: number = 0) {
        try {
            const params: JournalParams = {
                limit: this.pageSize,
                offset: offset || 0,
                sourcename: keyword
            };
            const result = yield this.store.query('journal', removeEmptyQueryParams(params));
            const results = result.toArray();
            this.canLoadMore = results.length >= this.pageSize;
            return results;
        } catch (errors) {
            if (!didCancel(errors)) {
                throw errors;
            }
        }
    }

    /**
     * Loads the initial page of options
     * @return {Array}
     */
    @action
    @dontRunInFastboot
    async loadInitialPage() {
        try {
            const results = await taskFor(this.load).perform();
            this.options = results;
            return results;
        } catch (errors) {
            //catch errors
        }
    }

    /**
     * Searches for `Journal` records matching the given keyword
     * @param {String} keyword
     */
    @action
    async search(keyword: string | null) {
        //@ts-ignore TODO: Remove this when we have a type solution to this
        const results = await this.load.perform(keyword);
        this.options = results;
        return results;
    }

    /**
     * Loads the next page of `Journal` records matching the given keyword
     * @param {String} keyword
     * @return {Promise}
     */
    @action
    async loadMore(keyword?: string) {
        const results = this.options.toArray();
        const offset = results.length;
        const nextPage = await taskFor(this.load).perform(keyword, offset);
        results.pushObjects(nextPage);
        this.options = results;
        return results;
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'PowerSelect::Journal': typeof PowerSelectJournal;
    }
}
