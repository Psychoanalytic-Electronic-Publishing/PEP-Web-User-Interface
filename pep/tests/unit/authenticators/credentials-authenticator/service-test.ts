import { setupTest } from 'ember-qunit';

import { PepSecureAuthenticatedData } from 'pep/api';
import CredentialsAuthenticator, { SessionType } from 'pep/authenticators/credentials';
import PepSessionService from 'pep/services/pep-session';
import { module, test } from 'qunit';

module('Unit | Authenticator | credentials-authenticator', function(hooks) {
    setupTest(hooks);

    const expiresIn = 60; // 60 seconds

    const successfulAuthentication = (
        _url: string,
        _username: string,
        _password: string
    ): Promise<PepSecureAuthenticatedData> => {
        return new Promise((resolve) => {
            resolve({
                SessionId: '123',
                IsValidLogon: true,
                HasSubscription: true,
                IsValidUserName: true,
                ReasonId: 0,
                ReasonStr: 'Reason',
                SessionExpires: 2324234,
                SessionType: SessionType.CREDENTIALS,
                authenticator: 'credentials',
                expiresAt: 2930480283
            });
        });
    };

    const unsuccessfulAuthentication = (
        _url: string,
        _username: string,
        _password: string
    ): Promise<PepSecureAuthenticatedData> => {
        return new Promise((resolve) => {
            resolve({
                SessionId: '123',
                IsValidLogon: false,
                HasSubscription: true,
                IsValidUserName: true,
                ReasonId: 0,
                ReasonStr: 'Reason',
                SessionExpires: 2324234,
                SessionType: SessionType.CREDENTIALS,
                authenticator: 'credentials',
                expiresAt: 2930480283
            });
        });
    };

    // Replace this with your real tests.
    test('it exists', function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');
        assert.ok(authenticator);
    });

    test('Calculate correct expiration time', function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials') as CredentialsAuthenticator;
        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn);
        assert.equal(expirationTime, new Date(new Date().getTime() + expiresIn * 1000).getTime());
    });

    test('Does not return value if not passed expiration time', function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials') as CredentialsAuthenticator;
        const expiresIn = undefined;
        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn ?? 0);
        assert.notOk(expirationTime);
    });

    test('Restores fails with empty object', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials') as CredentialsAuthenticator;
        assert.rejects(authenticator.restore({} as PepSecureAuthenticatedData));
    });

    test('Restores fails without session ID', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials') as CredentialsAuthenticator;
        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn);
        assert.rejects(authenticator.restore({ expiresAt: expirationTime } as PepSecureAuthenticatedData));
    });

    test('Restores fails if IsValidLogin is false', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials') as CredentialsAuthenticator;
        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn) ?? 0;
        assert.rejects(
            authenticator.restore({ expiresAt: expirationTime, IsValidLogon: false } as PepSecureAuthenticatedData)
        );
    });

    test('Restores is successful', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials') as CredentialsAuthenticator;
        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn);
        const sessionData = { expiresAt: expirationTime, SessionId: '123', IsValidLogon: true };
        const result = await authenticator.restore(sessionData as PepSecureAuthenticatedData);
        assert.deepEqual(sessionData, result);
    });

    test('Authentication failure', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials') as CredentialsAuthenticator;
        authenticator.makeRequest = unsuccessfulAuthentication;
        const session = this.owner.lookup('service:pep-session') as PepSessionService;
        await assert.rejects(authenticator.authenticate('Test', 'TestPassword'));

        const unauthenticatedSession = session.getUnauthenticatedSession();
        assert.equal(unauthenticatedSession?.IsValidLogon, false);
        assert.ok(unauthenticatedSession?.SessionId);
    });

    test('Authentication successful', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials') as CredentialsAuthenticator;
        authenticator.makeRequest = successfulAuthentication;
        const result = await authenticator.authenticate('Test', 'TestPassword');

        assert.equal(result.IsValidLogon, true);
    });

    // test('Unauthenticated session cleared after successful auth', async function(assert) {
    //     const authenticator = this.owner.lookup('authenticator:credentials');
    //     const session = this.owner.lookup('service:pep-session');
    //     authenticator.makeRequest = successfulAuthentication;
    //     const expirationTime = authenticator._absolutizeExpirationTime(expiresIn);
    //     const sessionData = { expiresAt: expirationTime, SessionId: '123', IsValidLogon: true };
    //     session.setUnauthenticatedSession(sessionData);

    //     let unauthenticatedSession = session.getUnauthenticatedSession();
    //     assert.equal(unauthenticatedSession.SessionId, '123');

    //     await authenticator.authenticate('Test', 'TestPassword');
    //     unauthenticatedSession = session.getUnauthenticatedSession();
    //     assert.notOk(unauthenticatedSession);
    // });
});
