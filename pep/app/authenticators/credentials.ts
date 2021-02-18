import { run } from '@ember/runloop';
import { EmberRunTimer } from '@ember/runloop/types';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { isEmpty } from '@ember/utils';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import IntlService from 'ember-intl/services/intl';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import { PepSecureAuthenticatedData } from 'pep/api';
import ENV from 'pep/config/environment';
import AjaxService from 'pep/services/ajax';
import PepSessionService from 'pep/services/pep-session';
import { guard } from 'pep/utils/types';
import { serializeQueryParams } from 'pep/utils/url';
import { reject, resolve } from 'rsvp';

export enum SessionType {
    CREDENTIALS = 'credentials',
    IP = 'ip'
}

export interface AuthError {
    payload: PepSecureAuthenticatedData;
    response: Response;
}

export default class CredentialsAuthenticator extends BaseAuthenticator {
    @service ajax!: AjaxService;
    @service intl!: IntlService;
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
    _absolutizeExpirationTime(expiresIn: number): number | undefined {
        if (!isEmpty(expiresIn)) {
            return new Date(new Date().getTime() + expiresIn * 1000).getTime();
        } else {
            return undefined;
        }
    }

    /**
     * Calculate the expires at value and add it to the response so it gets saved in the cookie
     *
     * @param {PepSecureAuthenticatedData} response
     * @returns
     * @memberof CredentialsAuthenticator
     */
    setupExpiresAt(response: PepSecureAuthenticatedData): PepSecureAuthenticatedData {
        const expiresAt = this._absolutizeExpirationTime(response.SessionExpires);
        if (expiresAt && !isEmpty(expiresAt)) {
            Object.assign(response, { expiresAt });
        }
        return response;
    }

    /**
     * Authenticates and logs the user in as well as schedules a session expiration based on the
     * SessionExpires number that is sent back in the result
     *
     * @param {string} username
     * @param {string} password
     * @return {*}
     * @memberof CredentialsAuthenticator
     */
    async authenticate(username: string, password: string): Promise<PepSecureAuthenticatedData> {
        try {
            const sessionId = this.session.sessionId;
            const params = serializeQueryParams({ SessionId: sessionId });
            let url = `${ENV.authBaseUrl}/Authenticate`;
            if (sessionId) {
                url = `${url}?${params}`;
            }

            const response = await this.ajax.request<PepSecureAuthenticatedData>(url, {
                method: 'POST',
                headers: this.authenticationHeaders,
                body: this.ajax.stringifyData({
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
                return reject(response.ReasonStr);
            }
        } catch (errors) {
            if (guard<AuthError>(errors, 'payload')) {
                return reject(htmlSafe(errors.payload?.ReasonStr ?? this.intl.t('login.error')));
            } else {
                return reject(this.intl.t('login.genericError'));
            }
        }
    }

    /**
     * Invalidates the local session and logs the user out
     */
    async invalidate(data: PepSecureAuthenticatedData): Promise<void> {
        try {
            const params = serializeQueryParams({ SessionId: data.SessionId });
            await this.ajax.request(`${ENV.authBaseUrl}/Users/Logout?${params}`, {
                method: 'POST',
                headers: this.authenticationHeaders
            });
            return resolve();
        } catch (errors) {
            return resolve();
        } finally {
            this._cancelTimeout();
        }
    }

    /**
     * Restores the local session from cookies, if one exists. Also schedule the session expiration
     * if needed
     * @param {SessionAuthenticatedData} data
     */
    restore(data: PepSecureAuthenticatedData): Promise<unknown> {
        return new Promise((resolve, reject) => {
            const now = new Date().getTime();
            if (!isEmpty(data.expiresAt) && data.expiresAt <= now) {
                this.session.invalidate(data);
                reject();
            } else {
                if (isEmpty(data.SessionId)) {
                    reject();
                } else {
                    this._scheduleSessionExpiration(data);
                    resolve(data);
                }
            }
        });
    }

    /**
     * Schedule the session expiration to run
     *
     * @param {PepSecureAuthenticatedData} data
     * @memberof CredentialsAuthenticator
     */
    _scheduleSessionExpiration(data: PepSecureAuthenticatedData): void {
        let expiresAt = data.expiresAt;
        const expiresIn = data.SessionExpires;
        const scheduleExpiration = !this.fastboot.isFastBoot;
        if (scheduleExpiration) {
            const now = new Date().getTime();
            if (isEmpty(expiresAt) && !isEmpty(expiresIn)) {
                expiresAt = new Date(now + expiresIn * 1000).getTime();
            }
            this._cancelTimeout();
            this._invalidateTimeout = run.later(this, this.session.invalidate, data, expiresAt! - now);
        }
    }

    /**
     * Cancel the timeout that keeps track of the session expiration
     *
     * @memberof CredentialsAuthenticator
     */
    _cancelTimeout(): void {
        if (this._invalidateTimeout) {
            run.cancel(this._invalidateTimeout);
            delete this._invalidateTimeout;
        }
    }
}
