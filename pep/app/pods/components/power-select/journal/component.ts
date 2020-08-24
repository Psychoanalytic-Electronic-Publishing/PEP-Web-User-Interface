import Component from '@glimmer/component';
import PowerSelectInfinityWithSearch from 'pep/pods/components/power-select-infinity/with-search/component';
import Journal from 'pep/pods/journal/model';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { DS } from 'ember-data';
import { inject as service } from '@ember/service';
import { didCancel } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
interface JournalParams {
    limit: number | null;
    offset: number | null;
    sourcecode?: any;
}

export default class PowerSelectJournal extends Component<PowerSelectInfinityWithSearch<Journal>> {
    @service store!: DS.Store;
    @service fastboot!: FastbootService;

    @tracked options!: Journal[];
    @tracked canLoadMore: boolean = true;
    @tracked pageSize: number = 20;

    /**
     * Queries the server for `tanks` using the passed in
     * keyword.
     *
     * @param {PowerSelectTankWithLocation} this
     * @param {string} keyword
     * @param {number} offset
     * @returns Tank[]
     */
    @restartableTask
    *load(keyword: string, offset: number) {
        try {
            const params: JournalParams = {
                limit: this.pageSize,
                offset: offset || 0
            };
            const result = yield this.store.query('journal', params);
            let results = result.toArray();
            this.canLoadMore = results.length >= this.pageSize;
            return results;
        } catch (errors) {
            if (!didCancel(errors)) {
                // this.notifications.groupErrors(errors);
                throw errors;
            }
        }
    }

    /**
     * Loads the initial page of options
     * @return {Array}
     */
    @action
    async loadInitialPage() {
        if (!this.fastboot.isFastBoot) {
            //@ts-ignore TODO: Remove this when we have a type solution to this
            const results = await this.load.perform();
            this.options = results;
            return results;
        }
    }

    /**
     * Searches for `Tank` records matching the given keyword
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
     * Loads the next page of `Tank` records matching the given keyword
     * @param {String} keyword
     * @return {Promise}
     */
    @action
    async loadMore(keyword: string | null) {
        const results = this.options.toArray();
        const offset = results.length;
        //@ts-ignore TODO: Remove this when we have a type solution to this
        const nextPage = await this.load.perform(keyword, offset);
        results.pushObjects(nextPage);
        this.options = results;
        return results;
    }
}
