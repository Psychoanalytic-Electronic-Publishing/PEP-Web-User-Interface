import { run } from '@ember/runloop';
import { htmlSafe } from '@ember/template';
import { computed } from '@ember/object';

import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';

import { PepSecureAuthenticatedData } from 'pep/api';
import CredentialsAuthenticator, { AuthError, SessionType } from 'pep/authenticators/credentials';
import ENV from 'pep/config/environment';
import { guard } from 'pep/utils/types';
import { serializeQueryParams } from 'pep/utils/url';
import RSVP from 'rsvp';
import IpSignatureService from 'pep/services/ip-signature';

@classic
export default class IpAuthenticator extends CredentialsAuthenticator {
    @service ipSignature!: IpSignatureService;

    @computed('fastboot.isFastBoot', 'fastboot.request.headers')
    get sourceIp(): string | null {
        if (!this.fastboot.isFastBoot) {
            return null;
        }

        return this.fastboot.request.headers.get('client-ip') || null;
    }

    /**
     * Authenticates and logs the user in using IP auth
     *
     * @param {string} sessionId
     * @returns
     * @memberof IpAuthenticator
     */
    async authenticate(): Promise<PepSecureAuthenticatedData> {
        const headers = this.authenticationHeaders;
        if (this.fastboot.isFastBoot) {
            const referrer = this.fastboot.request.headers?.get('referer');

            if (referrer) {
                headers['ReferrerURL-For-PEP'] = referrer;
            }

            if (this.sourceIp) {
                try {
                    headers['client-ip'] = '193.60.231.0';
                    headers['client-ip-signature'] = await this.ipSignature.generateIpSignature(this.sourceIp);
                } catch (error) {
                    console.error('Error generating IP signature: ', error);
                }
            }
        }

        return new RSVP.Promise((resolve, reject) => {
            try {
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

                this.ajax
                    .request<PepSecureAuthenticatedData>(url, {
                        headers
                    })
                    .then(
                        (response) => {
                            console.log('IpAuthenticator.authenticate response', response);
                            run(() => {
                                if (response.IsValidLogon) {
                                    this.session.clearUnauthenticatedSession();
                                    response.SessionType = sessionType;

                                    const expiresAt = this._absolutizeExpirationTime(response['SessionExpires']);

                                    if (expiresAt) {
                                        response['expiresAt'] = expiresAt;
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
}
