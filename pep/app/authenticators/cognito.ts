import CognitoService, { AuthenticatedSessionData } from 'pep/services/cognito';
import { inject as service } from '@ember/service';
import BaseAuthenticator from 'ember-simple-auth/authenticators/base';

export default class CognitoAuthenticator extends BaseAuthenticator {
    @service cognito!: CognitoService;

    /**
     * Authenticates the user session using AWS Cognito
     *
     * @param {String} username
     * @param {String} password
     * @returns Promise<AuthenticatedSessionData>
     */
    authenticate(username: string, password: string): Promise<AuthenticatedSessionData> {
        return this.cognito.signIn(username, password);
    }

    /**
     * Restores the user session using AWS Cognito
     *
     * @returns Promise<AuthenticatedSessionData>
     */
    async restore(/*data: AuthenticatedSessionData*/): Promise<AuthenticatedSessionData> {
        return this.cognito.restoreSession();
    }

    /**
     * Invalidates the user session using AWS Cognito
     *
     * @returns Promise<undefined>
     */
    async invalidate(/*data, args*/): Promise<undefined> {
        return this.cognito.signOut();
    }
}
