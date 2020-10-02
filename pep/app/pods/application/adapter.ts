import { inject as service } from '@ember/service';
import { classify } from '@ember/string';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import DS from 'ember-data';
import FastbootAdapter from 'ember-data-storefront/mixins/fastboot-adapter';

import ENV from 'pep/config/environment';
import PepSessionService from 'pep/services/pep-session';
import { appendTrailingSlash, serializeQueryParams } from 'pep/utils/url';
import { reject } from 'rsvp';

export interface ApiServerError {
    code: string;
    status?: string;
    detail?: string;
    meta: {
        entity?: string;
    };
}

export interface ApiServerErrorResponse {
    errors: ApiServerError[];
}

export type SnapshotWithQuery = DS.Snapshot & { adapterOptions: { query: any } };

//@ts-ignore TODO we need to figure out how to allow DS.RESTAdapter with custom properties correctly
export default class Application extends DS.RESTAdapter.extend(FastbootAdapter) {
    @service('pep-session') session!: PepSessionService;
    @service fastboot!: FastbootService;

    host = ENV.apiBaseUrl;
    namespace = ENV.apiNamespace;

    /**
     * Customize the default model endpoint paths
     * @param {String} modelName
     */
    pathForType<K extends string | number>(modelName: K) {
        const path = super.pathForType(modelName);
        return classify(path);
    }

    /**
     * Modifies all request URLs to have a trailing slash
     * @template K
     * @param {(K | undefined)} [modelName]
     * @param {(string | {} | any[] | null | undefined)} [id]
     * @param {(any[] | DS.Snapshot<K> | null | undefined)} [snapshot]
     * @param {(string | undefined)} [requestType]
     * @param {({} | undefined)} [query]
     * @returns {string}
     */
    buildURL<K extends string | number>(
        modelName?: K | undefined,
        id?: string | {} | any[] | null | undefined,
        snapshot?: any[] | DS.Snapshot<K> | null | undefined,
        requestType?: string | undefined,
        query?: {} | undefined
    ): string {
        const url = super.buildURL(modelName, id, snapshot, requestType, query);
        return appendTrailingSlash(url);
    }

    /**
     * When using ember-fetch with ember-simple-auth, authorization headers must be manually set
     * @returns Object
     */
    get headers() {
        const headers = { 'client-id': ENV.clientId } as any;
        if (this.session.isAuthenticated) {
            const { SessionId } = this.session.data.authenticated;
            headers['client-session'] = SessionId;
        } else {
            headers['client-session'] = this.session?.getUnauthenticatedSession()?.SessionId;
        }

        if (this.fastboot.isFastBoot) {
            const headers = this.fastboot.request.headers;
            console.log(this.fastboot.request);
            const xForwardedFor = headers.get('X-Forwarded-For');
            headers['X-Forwarded-For'] = xForwardedFor;
        }

        return headers;
    }

    /**
     * Handles unauthenticated requests (logs the user out)
     * @param  {Number} status
     * @param  {Object} headers
     * @returns Object
     */
    handleResponse(status: number, headers: {}, payload: {}, requestData: {}) {
        if (status === 401) {
            if (this.session.isAuthenticated) {
                this.session.invalidate();
                return reject();
            } else {
                this.browserRedirect('/login');
                return {};
            }
        }

        return super.handleResponse(status, headers, payload, requestData);
    }

    /**
     * Safely redirects to a new URL in client-side environments
     * @param  {String}  url
     * @param  {Number}  [statusCode=307]
     * @param  {Boolean} [replace=false]
     * @returns Void
     */
    browserRedirect(url: string, statusCode = 307, replace = false) {
        if (this.fastboot.isFastBoot) {
            //avoid redirect loops
            if (this.fastboot.request.path !== url) {
                this.fastboot.response.statusCode = statusCode;
                this.fastboot.response.headers.set('Location', url);
            }
        } else if (replace) {
            window.location.replace(url);
        } else {
            window.location.href = url;
        }
    }

    /**
     * Append query params to a url
     *
     * @param {string} url
     * @param {SnapshotWithQuery} snapshot
     * @returns {string}
     * @memberof Application
     */
    appendQueryParams(url: string, snapshot: SnapshotWithQuery) {
        let query = snapshot?.adapterOptions?.query;
        if (query) {
            url += `?${serializeQueryParams(query)}`;
        }
        return url;
    }
    /**
     * Overrides the urlForFindRecord to allow for a find request with a query param
     * @see https://github.com/emberjs/data/issues/3596#issuecomment-126604014
     *
     * @template K
     * @param {string} id
     * @param {K} modelName
     * @param {DS.Snapshot<K>} snapshot
     * @returns {string}
     * @memberof Application
     */
    urlForFindRecord<K extends string | number>(id: string, modelName: K, snapshot: DS.Snapshot<K>) {
        const url = super.urlForFindRecord(id, modelName, snapshot);
        return this.appendQueryParams(url, (snapshot as unknown) as SnapshotWithQuery);
    }
}

declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        application: Application;
    }
}
