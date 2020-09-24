import ENV from 'pep/config/environment';
import CredentialsAuthenticator, { SessionType } from 'pep/authenticators/credentials';
import { inject as service } from '@ember/service';
import PepSessionService from 'pep/services/pep-session';
import { PepSecureAuthenticatedData } from 'pep/api';

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
        const sessionData = this.session.getUnauthenticatedSession();
        let url = `${ENV.authBaseUrl}/Authenticate/ip`;
        if (sessionData?.SessionId) {
            url = url + `?SessionId=${sessionData.SessionId}`;
        }
        const response = await this.ajax.request<PepSecureAuthenticatedData>(url, {
            headers: this.authenticationHeaders
        });
        response.SessionType = SessionType.IP;
        this.session.setUnauthenticatedSession(response);
        const expiresAt = this._absolutizeExpirationTime(response.SessionExpires);
        this._scheduleSessionExpiration(response.SessionExpires, expiresAt);
        return response;
    }
}
