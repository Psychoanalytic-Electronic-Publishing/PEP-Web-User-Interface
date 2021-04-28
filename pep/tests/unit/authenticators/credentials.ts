import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Authenticator | credentials', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const credentialsAuthenticator = this.owner.lookup('authenticator:credentials');
        assert.ok(credentialsAuthenticator);
    });

    test('it exist2s', function(assert) {
        const credentialsAuthenticator = this.owner.lookup('authenticator:credentials');
        assert.ok(credentialsAuthenticator);
    });
});
