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

export enum SessionType {
    CREDENTIALS = 'credentials',
    IP = 'ip'
}

export default class CredentialsAuthenticator extends BaseAuthenticator {
    @service ajax!: AjaxService;
    @service('pep-session') session!: PepSessionService;
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

    /**
     * Authenticates and logs the user in as well as schedules a session expiration based on the
     * SessionExpires number that is sent back in the result
     * @param  {String} username
     * @param {String} password
     */
    async authenticate(username: string, password: string) {
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

        response.SessionType = SessionType.CREDENTIALS;
        const expiresAt = this._absolutizeExpirationTime(response.SessionExpires);
        this._scheduleSessionExpiration(response.SessionExpires, expiresAt);
        if (expiresAt && !isEmpty(expiresAt)) {
            Object.assign(response, { expiresAt: expiresAt });
        }
        return response;
    }

    /**
     * Invalidates the local session and logs the user out
     */
    async invalidate(data: PepSecureAuthenticatedData) {
        const params = serializeQueryParams({ SessionId: data.SessionId });
        await this.ajax.request(`${ENV.authBaseUrl}/Users/Logout?${params}`, {
            method: 'POST',
            headers: this.authenticationHeaders
        });
        this._cancelTimeout();
    }

    /**
     * Restores the local session from cookies, if one exists. Also schedule the session expiration
     * if needed
     * @param {SessionAuthenticatedData} data
     */
    restore(data: PepSecureAuthenticatedData) {
        return new Promise((resolve, reject) => {
            const now = new Date().getTime();
            if (!isEmpty(data.expiresAt) && data.expiresAt < now) {
                resolve(this.invalidate(data));
            } else {
                if (isEmpty(data.SessionId)) {
                    reject();
                } else {
                    this._scheduleSessionExpiration(data.SessionExpires, data.expiresAt);
                    resolve(data);
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
    _scheduleSessionExpiration(expiresIn: number, expiresAt?: number) {
        const scheduleExpiration = !isFastBoot(getOwner(this));
        if (scheduleExpiration) {
            const now = new Date().getTime();
            if (isEmpty(expiresAt) && !isEmpty(expiresIn)) {
                expiresAt = new Date(now + expiresIn * 1000).getTime();
            }
            this._cancelTimeout();
            this._invalidateTimeout = run.later(this, this.invalidate, expiresIn, expiresAt! - now);
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
