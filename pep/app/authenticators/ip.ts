import { run } from '@ember/runloop';

import classic from 'ember-classic-decorator';

import { PepSecureAuthenticatedData } from 'pep/api';
import CredentialsAuthenticator, { AuthError, SessionType } from 'pep/authenticators/credentials';
import ENV from 'pep/config/environment';
import htmlSafe from 'pep/helpers/html-safe';
import { guard } from 'pep/utils/types';
import { serializeQueryParams } from 'pep/utils/url';
import RSVP from 'rsvp';

@classic
export default class IpAuthenticator extends CredentialsAuthenticator {
    /**
     * Authenticates and logs the user in using IP auth
     *
     * @param {string} sessionId
     * @returns
     * @memberof IpAuthenticator
     */
    async authenticate(): Promise<PepSecureAuthenticatedData> {
        return new RSVP.Promise((resolve, reject) => {
            try {
                console.log(`In IP authenticator`);
                const sessionData = this.session.getUnauthenticatedSession();
                let url = `${ENV.authBaseUrl}/Authenticate/ip`;

                // check for session id in query params
                let sessionType = SessionType.IP;
                if (this.fastboot.isFastBoot && this.fastboot.request.queryParams.sessionId) {
                    const params = serializeQueryParams({ SessionId: this.fastboot.request.queryParams.sessionId });
                    url = `${url}?${params}`;
                    sessionType = SessionType.CREDENTIALS;
                } else if (sessionData?.SessionId) {
                    const params = serializeQueryParams({ SessionId: sessionData.SessionId });
                    url = `${url}?${params}`;
                }
                const headers = this.authenticationHeaders;
                if (this.fastboot.isFastBoot) {
                    const referrer = this.fastboot.request.headers?.get('referer');

                    if (referrer) {
                        headers['ReferrerURL-For-PEP'] = referrer;
                    }
                }
                this.ajax
                    .request<PepSecureAuthenticatedData>(url, {
                        headers
                    })
                    .then(
                        (response) => {
                            run(() => {
                                console.log(`Have IP authenticate response: ${JSON.stringify(response)}`);
                                if (response.IsValidLogon) {
                                    console.log(`Is valid login`);
                                    this.session.clearUnauthenticatedSession();
                                    response.SessionType = sessionType;
                                    resolve(response);
                                } else {
                                    console.log(`Is not valid login`);
                                    this.session.setUnauthenticatedSession(response);
                                    console.log(
                                        `Call to getAuthenticatedSession in ip authenticator returns: ${JSON.stringify(
                                            this.session.getUnauthenticatedSession()
                                        )}`
                                    );
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
}
