import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { resolve, reject } from 'rsvp';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import AjaxService from 'pep/services/ajax';
import ENV from 'pep/config/environment';
import { PepSecureAuthenticatedData } from 'pep/api';
import { serializeQueryParams } from 'pep/utils/url';
import PepSessionService from 'pep/services/pep-session';
import isFastBoot from 'ember-simple-auth/utils/is-fastboot';
import { getOwner } from '@ember/application';
import { run } from '@ember/runloop';
import { EmberRunTimer } from '@ember/runloop/types';
import FastbootService from 'ember-cli-fastboot/services/fastboot';

export enum SessionType {
    CREDENTIALS = 'credentials',
    IP = 'ip'
}

export default class CredentialsAuthenticator extends BaseAuthenticator {
    @service ajax!: AjaxService;
    @service('pep-session') session!: PepSessionService;
    @service fastboot!: FastbootService;

    authenticationHeaders = {
        'Content-Type': 'application/json'
    };
    private _invalidateTimeout?: EmberRunTimer;

    /**
     * Calculate expiration time - copied from ember simple auth
     *
     * @param {number} expiresIn
     * @returns
     * @memberof CredentialsAuthenticator
     */
    _absolutizeExpirationTime(expiresIn: number) {
        if (!isEmpty(expiresIn)) {
            return new Date(new Date().getTime() + expiresIn * 1000).getTime();
        } else {
            return undefined;
        }
    }

    setupExpiresAt(response: PepSecureAuthenticatedData) {
        const expiresAt = this._absolutizeExpirationTime(response.SessionExpires);
        if (expiresAt && !isEmpty(expiresAt)) {
            Object.assign(response, { expiresAt: expiresAt });
        }
        return response;
    }

    /**
     * Authenticates and logs the user in as well as schedules a session expiration based on the
     * SessionExpires number that is sent back in the result
     * @param  {String} username
     * @param {String} password
     */
    async authenticate(username: string, password: string) {
        try {
            const sessionData = this.session.getUnauthenticatedSession();
            const response = await this.ajax.request<PepSecureAuthenticatedData>(`${ENV.authBaseUrl}/Authenticate`, {
                method: 'POST',
                headers: this.authenticationHeaders,
                body: this.ajax.stringifyData({
                    grant_type: 'password',
                    SessionId: sessionData?.SessionId,
                    UserName: username,
                    Password: password
                })
            });
            if (response.IsValidLogon) {
                this.session.clearUnauthenticatedSession();
                response.SessionType = SessionType.CREDENTIALS;
                const updatedResponse = this.setupExpiresAt(response);
                this._scheduleSessionExpiration(updatedResponse);
                return updatedResponse;
            } else {
                this.session.setUnauthenticatedSession(response);
                return Promise.reject(response);
            }
        } catch (errors) {
            return Promise.reject(errors);
        }
    }

    /**
     * Invalidates the local session and logs the user out
     */
    invalidate(data: PepSecureAuthenticatedData) {
        return new Promise((resolve) => {
            try {
                const params = serializeQueryParams({ SessionId: data.SessionId });
                this.ajax
                    .request(`${ENV.authBaseUrl}/Users/Logout?${params}`, {
                        method: 'POST',
                        headers: this.authenticationHeaders
                    })
                    .then(resolve);
            } finally {
                this._cancelTimeout();
                return resolve();
            }
        });
    }

    /**
     * Restores the local session from cookies, if one exists. Also schedule the session expiration
     * if needed
     * @param {SessionAuthenticatedData} data
     */
    restore(data: PepSecureAuthenticatedData) {
        return new Promise((resolve, reject) => {
            const now = new Date().getTime();
            if (!isEmpty(data.expiresAt) && data.expiresAt <= now) {
                reject(this.invalidate(data));
            } else {
                if (isEmpty(data.SessionId)) {
                    reject();
                } else {
                    resolve(data);
                    this._scheduleSessionExpiration(data);
                }
            }
        });
    }

    /**
     * Schedule the session expiration to run
     *
     * @param {number} expiresIn
     * @param {number} [expiresAt]
     * @memberof CredentialsAuthenticator
     */
    _scheduleSessionExpiration(data: PepSecureAuthenticatedData) {
        let expiresAt = data.expiresAt;
        const expiresIn = data.SessionExpires;
        const scheduleExpiration = !this.fastboot.isFastBoot;
        if (scheduleExpiration) {
            const now = new Date().getTime();
            if (isEmpty(expiresAt) && !isEmpty(expiresIn)) {
                expiresAt = new Date(now + expiresIn * 1000).getTime();
            }
            this._cancelTimeout();
            this._invalidateTimeout = run.later(this, this.invalidate, data, expiresAt! - now);
        }
    }

    /**
     * Cancel the timeout that keeps track of the session expiration
     *
     * @memberof CredentialsAuthenticator
     */
    _cancelTimeout() {
        if (this._invalidateTimeout) {
            run.cancel(this._invalidateTimeout);
            delete this._invalidateTimeout;
        }
    }
}