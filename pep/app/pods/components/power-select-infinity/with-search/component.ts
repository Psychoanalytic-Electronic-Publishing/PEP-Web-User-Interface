import { action } from '@ember/object';
import { isBlank } from '@ember/utils';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import { didCancel, timeout, Yieldable } from 'ember-concurrency';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface PowerSelectInfinityWithSearchArgs<T> {
    options: any[];
    search: (keyword: string | null) => T[];
    loadMore: (keyword: string | null) => T[];
    canLoadMore: boolean;
    selected: any;
    placeholder: string;
    searchPlaceholder: string;
    searchField: string;
    disabled: boolean;
    onChange(): any;
    renderInPlace: boolean;
    loadingMessage: boolean;
    selectedItemComponent: string;
    triggerClass?: string;
    loadingBelow?: boolean;
}

export default class PowerSelectInfinityWithSearch<T> extends Component<
    BaseGlimmerSignature<PowerSelectInfinityWithSearchArgs<T>>
> {
    //config options
    searchMessage?: string;
    searchDebounceDelay: number = 300;
    matchTriggerWidth: boolean = true;
    bufferSize: number = 0;
    estimateHeight: number = 12;
    staticHeight: boolean = true;

    //component state
    @tracked searchText: string | null = null;
    @tracked isLoadingMore: boolean = false;

    get options() {
        return this.args.options;
    }

    get triggerClass() {
        return this.args?.triggerClass ?? 'form-control';
    }

    get loadingBelow() {
        return this.args?.loadingBelow ?? true;
    }

    /**
     * The delayed search task for the power select
     *
     * @param {(string | null)} term
     * @return any[]
     */
    @restartableTask
    *searchTask(term: string | null): Generator<T[] | Yieldable<void>, any, unknown> {
        yield timeout(this.searchDebounceDelay);
        try {
            const results = yield this.args.search(term);
            return results;
        } catch (errors) {
            if (!didCancel(errors)) {
                throw errors;
            }
            return [];
        }
    }

    /**
     * Keeps track of the currently entered search input
     * @param {String} term
     * @return {Void}
     */
    @action
    onSearchInput(term: string) {
        this.searchText = term;

        //since the search action is not invoked when the search term is blank,
        //invoke it manually, so that the options are reset
        if (isBlank(term)) {
            this.onSearch(term);
        }
    }

    /**
     * Invokes the search action after a debounced delay when the user types in the search box
     * @param {String} term
     * @return {Promise}
     */
    @action
    onSearch(term: string) {
        return taskFor(this.searchTask).perform(term);
    }

    /**
     * Invokes the loadMore action when the bottom of the options list is reached
     * @return {Promise}
     */
    @action
    async onLastReached() {
        if (this.isLoadingMore || !this.args.canLoadMore) {
            return;
        }
        try {
            this.isLoadingMore = true;
            const result = await this.args.loadMore(this.searchText);
            this.isLoadingMore = false;
            return result;
        } catch (errors) {
            this.isLoadingMore = false;
            if (!didCancel(errors)) {
                throw errors;
            }
            return [];
        }
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'PowerSelectInfinity::WithSearch': typeof PowerSelectInfinityWithSearch;
    }
}
