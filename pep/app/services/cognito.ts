import ENV from 'pep/config/environment';
import CookieStorage from 'pep/services/cookie-storage';
import Auth, { CognitoUser } from '@aws-amplify/auth';
import Amplify from '@aws-amplify/core';
import { getOwner } from '@ember/application';
import Service, { inject as service } from '@ember/service';
import { CognitoUserSession } from 'amazon-cognito-identity-js';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import SessionService from 'ember-simple-auth/services/session';
import fetch from 'fetch';
import { Promise as RsvpPromise, resolve } from 'rsvp';

export interface AuthenticatedSessionData {
    access_token: string;
}

export default class CognitoService extends Service {
    @service session!: SessionService;
    @service fastboot!: FastbootService;

    cognitoUser: CognitoUser | null = null;

    /**
     * Configures amplify's auth/cognito with the application's environment config
     * provided values. Also configures a custom storage class which uses
     * ember-cookies to store/retrieve cookies, so that it is fastboot-compatible
     */
    configureAmplify(): void {
        CookieStorage.owner = getOwner(this);

        //amplify is expecting the `fetch()` API to be in the global context like it
        //is in the browser. so make the node fetch() implementation accessible to it
        //@see https://github.com/aws-amplify/amplify-js/issues/403
        if (this.fastboot.isFastBoot) {
            //@ts-ignore
            global.fetch = fetch;
        }

        Amplify.configure({
            Auth: {
                userPoolWebClientId: ENV.cognito.userPoolWebClientId,
                userPoolId: ENV.cognito.userPoolId,
                region: ENV.cognito.region,
                cookieStorage: {
                    domain: ENV.cognito.cookieStorage.domain,
                    path: ENV.cognito.cookieStorage.path,
                    expires: ENV.cognito.cookieStorage.expires,
                    secure: ENV.cognito.cookieStorage.secure
                },
                storage: CookieStorage
            }
        });
    }

    /**
     * Signs the user out from cognito via Amplify and clears the cognito user reference.
     *
     * This should never really be called directly, its mainly intended to be used
     * by the ember-simple-auth cognito authenticator's `invalidate()` method.
     *
     * @returns Promise<undefined>
     */
    async signOut(): Promise<any> {
        if (this.cognitoUser) {
            await this.cognitoUser.signOut();
            this.cognitoUser = null;
        }
    }

    /**
     * Signs in the user using the provided username and password via Amplify and
     * then retrieves the user's cognito session and returns he authentication data
     * that can be used by ember-simple-auth to create an authenticated session.
     *
     * This should never really be called directly, its mainly intended to be used
     * by the ember-simple-auth cognito authenticator's `authenticate()` method.
     *
     * @param {String} username
     * @param {String} password
     * @returns Promise<AuthenticatedSessionData>
     */
    async signIn(username: string, password: string): Promise<AuthenticatedSessionData> {
        try {
            this.configureAmplify();
            const cognitoUser = (await Auth.signIn(username, password)) as CognitoUser;
            const authData = await this.resolveAuthData(cognitoUser);
            return authData;
        } catch (error) {
            //format error to look like our API errors array responses
            throw [error];
        }
    }

    /**
     * Retrieves the currently authenticated cognito user session (either via the
     * cognito API or from locally stored cookies if they are valid) and returns
     * the authentication data that can be used by ember-simple-auth to restore
     * its own authenticated session.
     *
     * This should never really be called directly, its mainly intended to be used
     * by the ember-simple-auth cognito authenticator's `restore()` method.
     *
     * NOTE: The authethenticator restore() method _can_ pass this the old
     * authenticated session data if needed. for instance if we wanted to store
     * the user's poolId/clientId in the auth data and use that when configuring amplify.
     *
     * @returns Promise<AuthenticatedSessionData>
     */
    async restoreSession(/*data: AuthenticatedSessionData*/): Promise<AuthenticatedSessionData> {
        this.configureAmplify();
        const cognitoUser = (await Auth.currentAuthenticatedUser()) as CognitoUser;
        const authData = await this.resolveAuthData(cognitoUser);
        return authData;
    }

    /**
     * If we have a valid authenticated ember-simple-auth session, this will invoke
     * Amplify's Auth.currentSession() which will automatically refresh the session
     * if the current session is expired, and we have a valid refresh token stored.
     * Otherwise, the existing locally stored session will be immediately returned
     * if its not expired.
     *
     * Generally, this will only need to be called from API request points (i.e.
     * the Ember Data application adapter's `ajax()` method, and the Ajax service's
     * `request()` method) just prior to making the request, so that we ensure the
     * API request will be properly authethenticated with a valid token.
     *
     * @returns Promise<AuthenticatedSessionData | undefined>
     */
    async refreshSessionIfNeeded(): Promise<AuthenticatedSessionData | undefined> {
        if (this.session.isAuthenticated) {
            try {
                await Auth.currentSession();
                const cognitoUser = (await Auth.currentAuthenticatedUser()) as CognitoUser;
                return this.resolveAuthData(cognitoUser);
            } catch (error) {
                //swallow failed session refreshes
                //and just allow subsequent failed/401 API responses to invalidate the session
                return resolve();
            }
        } else {
            return resolve();
        }
    }

    /**
     * Requests to change a user's `password`
     *
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns Promise<'SUCCESS'>
     */
    changePassword(oldPassword: string, newPassword: string): Promise<'SUCCESS'> {
        return new Promise((resolve, reject) => {
            this.cognitoUser?.changePassword(oldPassword, newPassword, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });
        });
    }

    /**
     *  Sends a forgot password request to Cognito with the given email address
     *
     * Possible error response codes:
     * @see https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ForgotPassword.html
     *
     * @param {String} email
     * @returns Promise<any>
     */
    async forgotPassword(email: string): Promise<any> {
        try {
            this.configureAmplify();
            const result = await Auth.forgotPassword(email);
            return result;
        } catch (error) {
            //format error to look like our API errors array responses
            throw [error];
        }
    }

    /**
     * Completes a Cognito reset password request
     *
     * Possible error response codes:
     * @see https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_ConfirmForgotPassword.html#API_ConfirmForgotPassword_Errors
     *
     * @param {String} email
     * @param {String} code
     * @param {String} password
     * @returns Promise<void>
     */
    async resetPassword(email: string, code: string, password: string): Promise<void> {
        try {
            this.configureAmplify();
            return await Auth.forgotPasswordSubmit(email, code, password);
        } catch (error) {
            //format error to look like our API errors array responses
            throw [error];
        }
    }

    /**
     * Retrieves the cognito user session and formats the session data in the shape
     * required by ember-simple-auth. Alsos stores the cognito user, so we can use
     * it to refresh the session later as needed
     *
     * @param {CognitoUser} user
     * @returns Promise<AuthenticatedSessionData>}
     */
    private async resolveAuthData(user: CognitoUser): Promise<AuthenticatedSessionData> {
        const session = await this.getCognitoUserSession(user);
        //NOTE: ember-cognito appears to also store poolId/clientId here, but I believe
        //these should always be the same as the globally configured userPoolId and
        //userPoolWebClientId. but we should be able to pull them out of the user
        //session if needed
        const authData: AuthenticatedSessionData = {
            access_token: session!.getIdToken().getJwtToken()
        };

        this.cognitoUser = user;
        return authData;
    }

    /**
     * Promisified CognitoUser.getSession() helper method
     * @param {CognitoUser} user
     * @returns Promise<CognitoUserSession>
     */
    private getCognitoUserSession(user: CognitoUser): Promise<CognitoUserSession> {
        return new RsvpPromise((resolve, reject) => {
            user.getSession((err: Error, session: CognitoUserSession) => {
                if (err) {
                    return reject(err);
                }
                return resolve(session);
            });
        });
    }
}
