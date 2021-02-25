import { PepSecureAuthenticatedData } from 'pep/api';
import CredentialsAuthenticator, { AuthError, SessionType } from 'pep/authenticators/credentials';
import ENV from 'pep/config/environment';
import htmlSafe from 'pep/helpers/html-safe';
import { guard } from 'pep/utils/types';
import { serializeQueryParams } from 'pep/utils/url';
import { reject } from 'rsvp';

export default class IpAuthenticator extends CredentialsAuthenticator {
    /**
     * Authenticates and logs the user in using IP auth
     *
     * @param {string} sessionId
     * @returns
     * @memberof IpAuthenticator
     */
    async authenticate(): Promise<PepSecureAuthenticatedData> {
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
            const headers = this.authenticationHeaders;
            if (this.fastboot.isFastBoot) {
                const referrer = this.fastboot.request.headers.headers['referer'];

                if (referrer) {
                    headers['ReferrerURL-For-PEP'] = referrer;
                }
            }
            console.log(headers);
            const response = await this.ajax.request<PepSecureAuthenticatedData>(url, {
                headers
            });

            if (response.IsValidLogon && response.SessionId) {
                this.session.clearUnauthenticatedSession();
                response.SessionType = sessionType;
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
}
