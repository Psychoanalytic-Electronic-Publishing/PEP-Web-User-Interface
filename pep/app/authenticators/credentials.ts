import { run } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { isEmpty } from '@ember/utils';

import classic from 'ember-classic-decorator';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import CookiesService from 'ember-cookies/services/cookies';
import IntlService from 'ember-intl/services/intl';
import OAuth2PasswordGrant from 'ember-simple-auth/authenticators/oauth2-password-grant';

import { PepSecureAuthenticatedData } from 'pep/api';
import ENV from 'pep/config/environment';
import AjaxService from 'pep/services/ajax';
import PepSessionService from 'pep/services/session';
import { SESSION_COOKIE_NAME } from 'pep/session-stores/application';
import { guard } from 'pep/utils/types';
import { serializeQueryParams } from 'pep/utils/url';
import RSVP from 'rsvp';

export enum SessionType {
    CREDENTIALS = 'credentials',
    IP = 'ip'
}

export interface AuthError {
    payload: PepSecureAuthenticatedData;
    response: Response;
}

@classic
export default class CredentialsAuthenticator extends OAuth2PasswordGrant {
    @service ajax!: AjaxService;
    @service intl!: IntlService;
    @service session!: PepSessionService;
    @service fastboot!: FastbootService;
    @service cookies!: CookiesService;

    authenticationHeaders: { [key: string]: any } = {
        'Content-Type': 'application/json'
    };

    /**
     * Authenticates and logs the user in as well as schedules a session expiration based on the
     * SessionExpires number that is sent back in the result
     *
     * @param {string} username
     * @param {string} password
     * @return {*}
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
     */
    async invalidate(data: PepSecureAuthenticatedData): Promise<void> {
        // try {
        //     const params = serializeQueryParams({ SessionId: data.SessionId });
        //     await this.ajax.request(`${ENV.authBaseUrl}/Users/Logout?${params}`, {
        //         method: 'POST',
        //         headers: this.authenticationHeaders
        //     });
        //     return resolve();
        // } catch (errors) {
        //     return resolve();
        // } finally {
        //     this._cancelTimeout();
        // }
        const params = serializeQueryParams({ SessionId: data.SessionId });
        const serverTokenRevocationEndpoint = `${ENV.authBaseUrl}/Users/Logout?${params}`;
        function success(this: any, resolve: any) {
            run.cancel(this._cancelTimeout);
            delete this._cancelTimeout;
            resolve();
        }
        return new RSVP.Promise((resolve) => {
            if (isEmpty(serverTokenRevocationEndpoint)) {
                success.apply(this, [resolve]);
            } else {
                const requests: Promise<any>[] = [];
                ['SessionId'].forEach((tokenType) => {
                    const token = data[tokenType as keyof PepSecureAuthenticatedData];
                    if (!isEmpty(token)) {
                        requests.push(
                            this.ajax.request(serverTokenRevocationEndpoint, {
                                method: 'POST',
                                headers: this.authenticationHeaders
                            })
                        );
                    }
                });
                const succeed = () => {
                    success.apply(this, [resolve]);
                };
                RSVP.all(requests).then(succeed, succeed);
            }
        });
    }

    restore(data: any) {
        return new RSVP.Promise((resolve, reject) => {
            const now = new Date().getTime();

            if (!isEmpty(data['expiresAt']) && data['expiresAt'] < now) {
                reject();
            } else {
                if (!data.SessionId) {
                    reject();
                } else {
                    resolve(data);
                }
            }
        });
    }
}
