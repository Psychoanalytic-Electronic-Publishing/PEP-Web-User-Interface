import ENV from 'pep/config/environment';
import CognitoService from 'pep/services/cognito';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import DataAdapterMixin from 'ember-simple-auth/mixins/data-adapter-mixin';
import SessionService from 'ember-simple-auth/services/session';
import { reject } from 'rsvp';
//@ts-ignore TODO create types for this
import FastbootAdapter from 'ember-data-storefront/mixins/fastboot-adapter';
import FastbootService from 'ember-cli-fastboot/services/fastboot';

//@ts-ignore TODO we need to figure out how to allow DS.JSONAPIAdapter with custom properties correctly
export default class Application extends DS.JSONAPIAdapter.extend(DataAdapterMixin, FastbootAdapter) {
    @service session!: SessionService;
    @service fastboot!: FastbootService;
    /**
     * REMOVE THIS IF THE PROJECT DOES NOT USE AUTH/COGNITO
     * (NOTE: delete this comment in the project version)
     */
    @service cognito!: CognitoService;

    host = ENV.apiBaseUrl;

    /**
     * When using ember-fetch with ember-simple-auth, authorization headers must be manually set
     * @returns Object
     */
    get headers() {
        const headers = {} as any;
        if (this.session.isAuthenticated) {
            const { access_token } = this.session.data!.authenticated;
            headers['Authorization'] = `Bearer ${access_token}`;
        }

        return headers;
    }

    /**
     * REMOVE THIS IF THE PROJECT DOES NOT USE AUTH/COGNITO
     * (NOTE: delete this comment in the project version)
     */
    /**
     * Before ajax network requests are made to the API, check and make sure the
     * cognito user session is valid, and if not, refresh it.
     * @param {String} url
     * @param {String} type
     * @param {Object} options
     * @returns Promise
     */
    async ajax(url: string, type: string, options: {}) {
        await this.cognito.refreshSessionIfNeeded();
        return super.ajax(url, type, options);
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
}

declare module 'ember-data/types/registries/adapter' {
    export default interface AdapterRegistry {
        application: Application;
    }
}
