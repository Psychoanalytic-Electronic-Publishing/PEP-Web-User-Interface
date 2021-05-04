import { run } from '@ember/runloop';
import { EmberRunTimer } from '@ember/runloop/types';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { isEmpty } from '@ember/utils';

import Ember from 'ember';
import classic from 'ember-classic-decorator';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import CookiesService from 'ember-cookies/services/cookies';
import IntlService from 'ember-intl/services/intl';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

import { PepSecureAuthenticatedData } from 'pep/api';
import ENV from 'pep/config/environment';
import { SESSION_COOKIE_NAME } from 'pep/constants/cookies';
import AjaxService from 'pep/services/ajax';
import InformationBarService from 'pep/services/information-bar';
import PepSessionService from 'pep/services/pep-session';
import { guard } from 'pep/utils/types';
import { serializeQueryParams } from 'pep/utils/url';
import RSVP, { resolve } from 'rsvp';

export enum SessionType {
    CREDENTIALS = 'credentials',
    IP = 'ip'
}

export interface AuthError {
    payload: PepSecureAuthenticatedData;
    response: Response;
}

@classic
export default class CredentialsAuthenticator extends BaseAuthenticator {
    @service declare ajax: AjaxService;
    @service declare intl: IntlService;
    @service('pep-session') declare session: PepSessionService;
    @service declare fastboot: FastbootService;
    @service declare cookies: CookiesService;
    @service declare informationBar: InformationBarService;

    authenticationHeaders: { [key: string]: any } = {
        'Content-Type': 'application/json'
    };

    _authenticationInvalidationTimeout?: EmberRunTimer;

    /**
     * Authenticates and logs the user in as well as schedules a session expiration based on the
     * SessionExpires number that is sent back in the result
     *
     * @param {string} username
     * @param {string} password
     * @return {*}  {Promise<PepSecureAuthenticatedData>}
     * @memberof CredentialsAuthenticator
     */
    authenticate(username: string, password: string): Promise<PepSecureAuthenticatedData> {
        this.cookies.write(SESSION_COOKIE_NAME, JSON.stringify({ authenticated: {} }), {});
        return new RSVP.Promise((resolve, reject) => {
            try {
                const sessionId = this.session.sessionId;
                const params = serializeQueryParams({ SessionId: sessionId });
                let url = `${ENV.authBaseUrl}/Authenticate`;
                if (sessionId) {
                    url = `${url}?${params}`;
                }

                this.ajax
                    .request<PepSecureAuthenticatedData>(url, {
                        method: 'POST',
                        headers: this.authenticationHeaders,
                        body: this.ajax.stringifyData({
                            UserName: username,
                            Password: password
                        })
                    })
                    .then(
                        (response) => {
                            run(() => {
                                if (response.IsValidLogon) {
                                    this.session.clearUnauthenticatedSession();
                                    response.SessionType = SessionType.CREDENTIALS;
                                    const expiresAt = this._absolutizeExpirationTime(response['SessionExpires']);

                                    if (expiresAt) {
                                        response['expiresAt'] = expiresAt;
                                    }

                                    if (expiresAt) {
                                        this._scheduleAuthenticationInvalidation(response['SessionExpires'], expiresAt);
                                    }
                                    resolve(response);
                                } else {
                                    this.session.setUnauthenticatedSession(response);
                                    reject(response.ReasonStr);
                                }
                            });
                        },
                        (response) => {
                            run(null, reject, response);
                        }
                    );
            } catch (errors) {
                if (guard<AuthError>(errors, 'payload')) {
                    return reject(htmlSafe(errors.payload?.ReasonStr ?? this.intl.t('login.error')));
                } else {
                    return reject(this.intl.t('login.genericError'));
                }
            }
        });
    }

    /**
     * Invalidates the local session and logs the user out
     *
     * @param {PepSecureAuthenticatedData} data
     * @return {*}  {Promise<void>}
     * @memberof CredentialsAuthenticator
     */
    async invalidate(data: PepSecureAuthenticatedData): Promise<void> {
        const params = serializeQueryParams({ SessionId: data.SessionId });
        const serverTokenRevocationEndpoint = `${ENV.authBaseUrl}/Users/Logout?${params}`;

        try {
            await this.ajax.request(serverTokenRevocationEndpoint, {
                method: 'POST',
                headers: this.authenticationHeaders
            });
            if (this._authenticationInvalidationTimeout) {
                run.cancel(this._authenticationInvalidationTimeout);
                delete this._authenticationInvalidationTimeout;
            }
            return resolve();
        } catch (errors) {
            if (this._authenticationInvalidationTimeout) {
                run.cancel(this._authenticationInvalidationTimeout);
                delete this._authenticationInvalidationTimeout;
            }
            return resolve();
        }
    }

    /**
     * Restore the session using the passed in data
     *
     * @param {PepSecureAuthenticatedData} data
     * @return {*}  {(Promise<PepSecureAuthenticatedData | undefined>)}
     * @memberof CredentialsAuthenticator
     */
    restore(data: PepSecureAuthenticatedData): Promise<PepSecureAuthenticatedData | undefined> {
        return new RSVP.Promise((resolve, reject) => {
            const now = new Date().getTime();
            if (!isEmpty(data['expiresAt']) && data['expiresAt'] < now) {
                reject();
            } else {
                if (!data.IsValidLogon) {
                    reject();
                } else {
                    this._scheduleAuthenticationInvalidation(data['SessionExpires'], data['expiresAt']);
                    resolve(data);
                }
            }
        });
    }

    /**
     * Schedule the invalidation. We dont refresh the token, but when the session expires we should manually clear everything
     *
     * @param {number} expiresIn
     * @param {number} expiresAt
     * @memberof CredentialsAuthenticator
     */
    _scheduleAuthenticationInvalidation(expiresIn: number, expiresAt: number): void {
        if (!this.fastboot.isFastBoot) {
            const now = new Date().getTime();
            if (!expiresAt && expiresIn) {
                expiresAt = new Date(now + expiresIn * 1000).getTime();
            }

            if (expiresAt && expiresAt > now) {
                if (this._authenticationInvalidationTimeout) {
                    run.cancel(this._authenticationInvalidationTimeout);
                    delete this._authenticationInvalidationTimeout;
                }

                if (!Ember.testing) {
                    this._authenticationInvalidationTimeout = run.later(this, 'invalidateByTimeout', expiresAt - now);
                }
            }
        }
    }

    /**
     * Invalidate the session when the timeout is passed. We need to take a different path than the normal invalidate due to client
     * wanting a warning they have been logged out and an easy way to log back in
     *
     * @memberof CredentialsAuthenticator
     */
    invalidateByTimeout() {
        this.informationBar.show('relogin');
        this.session.redirectOnLogout = false;
        this.session.invalidate();
    }

    /**
     * Calculate the expiresAt time from the expiresIn time
     *
     * @param {number} expiresIn
     * @return {*}  {(number | undefined)}
     * @memberof CredentialsAuthenticator
     */
    _absolutizeExpirationTime(expiresIn: number): number | undefined {
        if (expiresIn) {
            return new Date(new Date().getTime() + expiresIn * 1000).getTime();
        }
    }
}
