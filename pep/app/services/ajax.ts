import ENV from 'pep/config/environment';
import CognitoService from 'pep/services/cognito';
import { computed, setProperties } from '@ember/object';
import { assign } from '@ember/polyfills';
import Service, { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import fetch from 'fetch';
import { reject } from 'rsvp';

export default class AjaxService extends Service {
    @service session!: SessionService;
    @service cognito!: CognitoService;

    /**
     * Add the oauth token authorization header to all requests
     * @return {Object}
     */
    @computed('session.{isAuthenticated,data.authenticated.access_token}')
    get authorizationHeaders() {
        const headers = {} as any;
        if (this.session.isAuthenticated) {
            const { access_token } = this.session.data!.authenticated;
            headers['Authorization'] = `Bearer ${access_token}`;
        }
        return headers;
    }

    /**
     * The default headers on all requests
     * @return {Object}
     */
    @computed('authorizationHeaders', 'clientIdentity.uuidHeader')
    get headers() {
        const headers = assign({ 'Content-Type': 'application/vnd.api+json' }, this.authorizationHeaders);
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
     * @return {Promise}
     */
    async request(url: string, options: RequestInit = {}) {
        await this.cognito.refreshSessionIfNeeded();

        setProperties(options, {
            credentials: 'include',
            headers: this.headers
        });

        const response = await fetch(`${ENV.apiBaseUrl}/${url.replace(/^\//, '')}`, options);
        const responseHeaders = this.parseHeaders(response.headers);
        const result = await this.handleResponse(response.status, responseHeaders, response);
        if (this.isSuccess(response.status)) {
            const isNoContent = this.normalizeStatus(response.status) === 204;
            if (isNoContent) {
                return result;
            } else {
                return await result.json();
            }
        } else {
            return reject(result);
        }
    }

    /**
     * Handles unauthenticated requests (logs the user out)
     * @param  {Number} status
     * @param  {Object} headers
     * @param  {Object} response
     * @return {Promise}
     */
    async handleResponse(status: number, _headers: {}, response: Response) {
        // uncomment when using the @gavant/ember-app-version-update addon
        // this.versionUpdate.checkResponseHeaders(headers);

        if (this.isSuccess(status)) {
            return response;
        }

        const error = new Error(response.statusText) as any;
        error.response = response;
        error.payload = await response.json();

        if (status === 401) {
            if (this.session.isAuthenticated) {
                this.session.invalidate();
                return reject();
            } else {
                return this.browserRedirect('/login');
            }
        }

        return error;
    }

    /**
     * returns true if the request contains a "success" status
     * @param  {String|Number}  status
     * @return {Boolean}
     */
    isSuccess(status: string | number) {
        let s = this.normalizeStatus(status);
        return (s >= 200 && s < 300) || s === 304;
    }

    /**
     * Converts string status codes to an integer value
     * @param  {String|Number}  status
     * @return {Number}
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
     * @return {Object}
     */
    parseHeaders(headers: Headers) {
        if (headers && typeof headers.keys === 'function') {
            const parsedHeaders = {} as any;
            for (let key of headers.keys()) {
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
     * @return {Void}
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
     * @return {String}
     */
    stringifyData(data: any) {
        return JSON.stringify({ data });
    }
}
