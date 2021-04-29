import { setupTest } from 'ember-qunit';

// import CredentialsAuthenticator from 'pep/authenticators/credentials';
import { module, test } from 'qunit';

module('Unit | Authenticator | credentials-authenticator', function(hooks) {
    setupTest(hooks);

    const expiresIn = 60; // 60 seconds

    // Replace this with your real tests.
    test('it exists', function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');
        assert.ok(authenticator);
    });

    test('Calculate correct expiration time', function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');
        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn);
        assert.equal(expirationTime, new Date(new Date().getTime() + expiresIn * 1000).getTime());
    });

    test('Does not return value if not passed expiration time', function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');
        const expiresIn = undefined;
        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn);
        assert.notOk(expirationTime);
    });

    test('Restores fails with empty object', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');
        assert.rejects(authenticator.restore({}));
    });

    test('Restores fails without session ID', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');
        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn);
        assert.rejects(authenticator.restore({ expiresAt: expirationTime }));
    });

    test('Restores fails if IsValidLogin is false', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');
        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn);
        assert.rejects(authenticator.restore({ expiresAt: expirationTime, IsValidLogin: false }));
    });

    test('Restores is successful', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');
        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn);
        const sessionData = { expiresAt: expirationTime, SessionId: '123', IsValidLogon: true };
        const result = await authenticator.restore(sessionData);
        assert.deepEqual(sessionData, result);
    });

    test('Authentication successful', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');

        const result = await authenticator.authenticate('Test6', 'Zedra001');

        assert.equal(result.IsValidLogon, true);
    });

    test('Unauthenticated session cleared after successful auth', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');
        const session = this.owner.lookup('service:pep-session');

        const expirationTime = authenticator._absolutizeExpirationTime(expiresIn);
        const sessionData = { expiresAt: expirationTime, SessionId: '123', IsValidLogon: true };
        session.setUnauthenticatedSession(sessionData);

        let unauthenticatedSession = session.getUnauthenticatedSession();
        assert.equal(unauthenticatedSession.SessionId, '123');

        await authenticator.authenticate('Test6', 'Zedra001');
        unauthenticatedSession = session.getUnauthenticatedSession();

        assert.notOk(unauthenticatedSession);
    });

    test('Authentication failure', async function(assert) {
        const authenticator = this.owner.lookup('authenticator:credentials');
        const session = this.owner.lookup('service:pep-session');
        await assert.rejects(authenticator.authenticate('Test6', 'Zedra0010'));

        const unauthenticatedSession = session.getUnauthenticatedSession();
        assert.equal(unauthenticatedSession.IsValidLogon, false);
        assert.ok(unauthenticatedSession.SessionId);
    });
});
