import { getOwner, setOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import { get, defineProperty } from '@ember/object';

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
     * The parent context object - the controller you want to use it on
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
            defineProperty(this, param, tracked());
            this[param] = this.context[param];
        });
    }

    update() {
        this.queryParams?.forEach((param) => {
            this.context[param] = get(this, param);
        });
    }
}

/**
 * Creates and returns a new QueryParams instance and binds its owner to be the same as
 * that of its parent Controller.
 * In most cases, this returned instance should be assigned to a @tracked property
 * on its parent context, so that it can be accessed on the associated template
 *
 * If using an object as a query param (eg. Model, POJO), be sure to add a computed to the getter
 * that grabs the value you need from the object
 * @param {QueryParamArgs} args
 */
export const useQueryParams = (args: QueryParamArgs) => {
    const owner = getOwner(args.context);
    const queryParams = new QueryParams(args);
    setOwner(queryParams, owner);
    return queryParams;
};
