import { computed, setProperties } from '@ember/object';
import Service, { inject as service } from '@ember/service';

import FastbootService from 'ember-cli-fastboot/services/fastboot';

import fetch from 'fetch';
import ENV from 'pep/config/environment';
import PepSessionService from 'pep/services/pep-session';
import { guard } from 'pep/utils/types';
import { appendTrailingSlash } from 'pep/utils/url';
import { reject } from 'rsvp';

export type RequestInitWithSlash = RequestInit & { appendTrailingSlash?: boolean };

export default class AjaxService extends Service {
    @service('pep-session') session!: PepSessionService;
    @service fastboot!: FastbootService;

    host: string = ENV.apiBaseUrl;
    namespace: string = ENV.apiNamespace;

    /**
     * Add the oauth token authorization header to all requests
     * @returns {Object}
     */
    @computed(
        'fastboot.isFastBoot',
        'fastboot.request.headers',
        'session.data.authenticated.SessionId',
        'session.isAuthenticated'
    )
    get authorizationHeaders() {
        const headers = {} as any;
        // api auth token is sent in cookies
        if (this.session.isAuthenticated && this.session.data) {
            const { SessionId } = this.session.data.authenticated;
            headers['client-session'] = SessionId ?? '';
        } else {
            headers['client-session'] = this.session?.getUnauthenticatedSession()?.SessionId ?? '';
        }
        console.log(
            `Ajax service get headers sessionID returns: ${this.session?.getUnauthenticatedSession()?.SessionId}`
        );
        if (this.fastboot.isFastBoot) {
            const fastbootHeaders = this.fastboot.request.headers;
            const xForwardedFor = (fastbootHeaders.get('X-Forwarded-For') as string) ?? '';
            headers['X-Forwarded-For-PEP'] = xForwardedFor.split(',')[0];
        }
        return headers;
    }

    /**
     * The default headers on all requests
     * @returns {Object}
     */
    @computed('authorizationHeaders')
    get headers() {
        const baseHeaders = {
            'Content-Type': 'application/vnd.api+json',
            'client-id': ENV.clientId
        };
        const headers = Object.assign(baseHeaders, this.authorizationHeaders);
        return headers;
    }

    /**
     * Usage example:
     * const response = await this.ajax.request('some-endpoint', {
     *     method: 'POST',
     *     body: this.ajax.stringifyData({ foo: 'bar' })
     * });
     * @param  {String}  url
     * @param  {RequestInit}  [options={}]
     * @returns {Promise}
     */
    async request<T>(url: string, options: RequestInitWithSlash = { appendTrailingSlash: true }): Promise<T> {
        console.log(`Making request to: ${url}`);
        console.log(
            `Call to getAuthenticatedSession in ip ajax service returns: ${JSON.stringify(
                this.session.getUnauthenticatedSession()
            )}`
        );
        setProperties(options, {
            credentials: 'include',
            headers: { ...this.headers, ...(options.headers || {}) }
        });
        console.log(`options for request: ${JSON.stringify(options)}`);

        const baseUrl = /^https?\:\/\//.test(url) ? '' : `${this.host}/${this.namespace}/`;
        let requestUrl = `${baseUrl}${url.replace(/^\//, '')}`;
        if (options.appendTrailingSlash) {
            requestUrl = appendTrailingSlash(requestUrl);
        }
        const response = await fetch(requestUrl, options);
        const responseHeaders = this.parseHeaders(response.headers);
        const result = await this.handleResponse(response.status, responseHeaders, response);
        if (this.isSuccess(response.status) && guard(result, 'status')) {
            console.log(`Request to ${url} was successful`);
            const isNoContent = this.normalizeStatus(response.status) === 204;
            if (isNoContent) {
                return result as any;
            } else {
                return (await result.json()) as T;
            }
        } else {
            console.log(`Request to ${url} was failure`);
            return reject(result);
        }
    }

    /**
     * Handles unauthenticated requests (logs the user out)
     * @param  {Number} status
     * @param  {Object} headers
     * @param  {Object} response
     * @returns {Promise}
     */
    async handleResponse(status: number, _headers: {}, response: Response): Promise<Response | Error> {
        // uncomment when using the @gavant/ember-app-version-update addon
        // this.versionUpdate.checkResponseHeaders(headers);

        if (this.isSuccess(status)) {
            return response;
        }

        const error = new Error(response.statusText) as any;
        error.response = response;
        error.payload = await response.json();

        try {
            if (status === 401 && this.session.isAuthenticated) {
                this.session.invalidate();
                return reject();
            }
        } catch (errors) {
            return errors;
        }

        return error as Error;
    }

    /**
     * returns true if the request contains a "success" status
     * @param  {String|Number}  status
     * @returns {Boolean}
     */
    isSuccess(status: string | number) {
        const s = this.normalizeStatus(status);
        return (s >= 200 && s < 300) || s === 304;
    }

    /**
     * Converts string status codes to an integer value
     * @param  {String|Number}  status
     * @returns {Number}
     */
    normalizeStatus(status: string | number) {
        let s = status;
        if (typeof status === 'string') {
            s = parseInt(status, 10);
        }

        return s;
    }

    /**
     * Converts a Headers instance into a plain POJO
     * @param  {Headers} headers
     * @returns {Object}
     */
    parseHeaders(headers: Headers) {
        if (headers && typeof headers.keys === 'function') {
            const parsedHeaders = {} as any;
            for (const key of headers.keys()) {
                parsedHeaders[key] = headers.get(key);
            }
            return parsedHeaders;
        } else {
            return headers;
        }
    }

    /**
     * Safely redirects to a new URL in client-side environments
     * @param  {String}  url
     * @param  {Number}  [statusCode=307]
     * @param  {Boolean} [replace=false]
     * @returns {Void}
     */
    browserRedirect(url: string, _statusCode: number = 307, replace: boolean = false) {
        if (replace) {
            window.location.replace(url);
        } else {
            window.location.href = url;
        }
    }

    /**
     * Converts a POJO to a JSON string, wrapped with a "data" object as the root key
     * @param  {Object} data
     * @returns {String}
     */
    stringifyData(data: any) {
        return JSON.stringify(data);
    }
}
