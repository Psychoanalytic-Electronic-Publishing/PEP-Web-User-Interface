import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { resolve, reject } from 'rsvp';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import AjaxService from 'pep/services/ajax';
import ENV from 'pep/config/environment';
import { PepSecureAuthenticatedData } from 'pep/api';
export default class IpAuthenticator extends BaseAuthenticator {
    @service ajax!: AjaxService;
    authenticationHeaders = {
        'Content-Type': 'application/json'
    };

    /**
     * Authenticates and logs the user in
     *
     * @param {string} sessionId
     * @returns
     * @memberof IpAuthenticator
     */
    async authenticate(sessionId: string) {
        const result = await this.ajax.request(`${ENV.authBaseUrl}/Authenticate/ip?SessionId=${sessionId}`, {
            headers: this.authenticationHeaders
        });
        return result;
    }

    /**
     * Invalidates the local session and logs the user out
     */
    invalidate(data: PepSecureAuthenticatedData) {
        return this.ajax.request(`${ENV.authBaseUrl}/Users/Logout`, {
            method: 'POST',
            headers: this.authenticationHeaders,
            body: this.ajax.stringifyData({
                SessionId: data.SessionId
            })
        });
    }

    /**
     * Restores the local session from cookies, if one exists
     * @param {SessionAuthenticatedData} data
     */
    restore(data: PepSecureAuthenticatedData) {
        if (!isEmpty(data.SessionId)) {
            return resolve(data);
        } else {
            return reject();
        }
    }
}
