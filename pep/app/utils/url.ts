import { QueryParamsObj } from '@gavant/ember-pagination/utils/query-params';
import { urlForDocumentQuery } from 'pep/pods/document/adapter';

import DS from 'ember-data';

const RBRACKET = /\[\]$/;

/**
 * Part of the `serializeQueryParams` helper function.
 * @param {any} obj
 * @return {Boolean}
 */
function isPlainObject(obj: any): boolean {
    return Object.prototype.toString.call(obj) === '[object Object]';
}

/**
 * Part of the `serializeQueryParams` helper function.
 * @param {Array<any>} s
 * @param {String} k
 * @param {string | () => string} v
 */
function add(s: Array<any>, k: string, v?: string | (() => string)) {
    // Strip out keys with undefined value and replace null values with
    // empty strings (mimics jQuery.ajax)
    if (v === undefined) {
        return;
    } else if (v === null) {
        v = '';
    }

    v = typeof v === 'function' ? v() : v;
    s[s.length] = `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
}

/**
 * Helper function that turns the data/body of a request into a query param string.
 * This is directly copied from jQuery.param.
 * @param {Object | String} queryParamsObject
 * @return {String}
 */
export function serializeQueryParams(queryParamsObject: object | string): string {
    var s: any[] = [];

    function buildParams(prefix: string, obj: any) {
        var i, len, key;

        if (prefix) {
            if (Array.isArray(obj)) {
                for (i = 0, len = obj.length; i < len; i++) {
                    if (RBRACKET.test(prefix)) {
                        add(s, prefix, obj[i]);
                    } else {
                        buildParams(prefix + '[' + (typeof obj[i] === 'object' ? i : '') + ']', obj[i]);
                    }
                }
            } else if (isPlainObject(obj)) {
                for (key in obj) {
                    buildParams(prefix + '[' + key + ']', obj[key]);
                }
            } else {
                add(s, prefix, obj);
            }
        } else if (Array.isArray(obj)) {
            for (i = 0, len = obj.length; i < len; i++) {
                add(s, obj[i].name, obj[i].value);
            }
        } else {
            for (key in obj) {
                buildParams(key, obj[key]);
            }
        }
        return s;
    }

    return buildParams('', queryParamsObject)
        .join('&')
        .replace(/%20/g, '+');
}

/**
 * Appends a trailing slash to a URL, accounting for query strings
 * @param {String} url
 * @returns {String}
 */
export function appendTrailingSlash(url: string) {
    const hasQueryStr = url.indexOf('?') !== -1;
    return hasQueryStr ? url.replace('?', '/?') : `${url}/`;
}

/**
 * Generate a CSV url for documents
 *
 * @param {DS.Store} store
 * @param {QueryParamsObj} queryParams
 * @returns
 */
export const documentCSVUrl = (store: DS.Store, queryParams: QueryParamsObj) => {
    delete queryParams.limit;
    queryParams.download = true;
    const url = urlForDocumentQuery(store, { queryType: queryParams.queryType });
    return `${url}?${serializeQueryParams(queryParams)}`;
};
