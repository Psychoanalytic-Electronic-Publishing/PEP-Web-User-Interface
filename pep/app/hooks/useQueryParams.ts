import { getOwner, setOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import DS from 'ember-data';
import Controller from '@ember/controller';

import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';
import Ember from 'ember';

export type RecordArrayWithMeta<T> = DS.AdapterPopulatedRecordArray<T> & { meta: any };

export interface ResponseMetadata {
    totalCount: number;
}

export interface Sorting {
    valuePath: string;
    sortPath?: string;
    isAscending: boolean;
}

export interface PaginationConfigs {
    limit?: number;
    filterList?: string[];
    includeList?: string[];
    pagingRootKey?: string | null;
    filterRootKey?: string | null;
    includeKey?: string;
    sortKey?: string;
    serverDateFormat?: string;
    processQueryParams?: (params: QueryParamsObj) => QueryParamsObj;
    onChangeSorting?: (sorts: string[], newSorts?: Sorting[]) => Promise<string[] | undefined> | void;
}

export interface QueryParamArgs {
    context: Controller;
    params: string[];
}

interface ControllerWithKeys extends Controller {
    [key: string]: any;
}

export class QueryParams {
    [key: string]: any;
    /**
     * The parent context object, usually a Controller or Component
     * @type {*}
     * @memberof Pagination
     */
    context: ControllerWithKeys;

    queryParams: string[] | undefined = [];

    constructor(args: QueryParamArgs) {
        this.context = args.context;
        this.queryParams = args.params;
        this.queryParams.forEach((param) => {
            // This handles tracking of object properties
            //https://github.com/emberjs/ember.js/issues/18362
            //@ts-ignore
            Ember.defineProperty(this, param, tracked());
            this[param] = this.context[param];
        });
    }

    update() {
        this.queryParams?.forEach((param) => {
            this.context[param] = Ember.get(this, param);
        });
        // This tells the route that the params have been updated. We wouldn't need this if we
        // didn't want to use object search params
        if (Array.isArray(this.context.queryParams)) {
            this.context.queryParams.forEach((param: any) => {
                let delegate = this.context._qpDelegate;
                delegate(param, Ember.get(this.context, param));
            });
        }
    }
}

/**
 * Creates and returns a new Pagination instance and binds its owner to be the same as
 * that of its parent "context" (e.g. Controller, Component, etc).
 * In most cases, this returned instance should be assigned to a @tracked property
 * on its parent context, so that it can be accessed on the associated template
 * @param {PaginationArgs} args
 */
export const useQueryParams = (args: QueryParamArgs) => {
    const owner = getOwner(args.context);
    const queryParams = new QueryParams(args);
    setOwner(queryParams, owner);
    return queryParams;
};
