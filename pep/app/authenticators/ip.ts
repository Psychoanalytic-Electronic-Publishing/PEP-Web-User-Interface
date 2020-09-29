import ENV from 'pep/config/environment';
import CredentialsAuthenticator, { SessionType } from 'pep/authenticators/credentials';
import { inject as service } from '@ember/service';
import PepSessionService from 'pep/services/pep-session';
import { PepSecureAuthenticatedData } from 'pep/api';
import { serializeQueryParams } from 'pep/utils/url';

export default class IpAuthenticator extends CredentialsAuthenticator {
    @service('pep-session') session!: PepSessionService;
    /**
     * Authenticates and logs the user in using IP auth
     *
     * @param {string} sessionId
     * @returns
     * @memberof IpAuthenticator
     */
    async authenticate() {
        try {
            const sessionData = this.session.getUnauthenticatedSession();
            let url = `${ENV.authBaseUrl}/Authenticate/ip`;

            if (sessionData?.SessionId) {
                const params = serializeQueryParams({ SessionId: sessionData.SessionId });
                url = `${url}?${params}`;
            }

            const response = await this.ajax.request<PepSecureAuthenticatedData>(url, {
                headers: this.authenticationHeaders
            });
            if (response.IsValidLogon) {
                this.session.clearUnauthenticatedSession();
                response.SessionType = SessionType.IP;
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
}
