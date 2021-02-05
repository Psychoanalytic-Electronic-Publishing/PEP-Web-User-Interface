import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Service | theme', function(hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function(assert) {
        const service = this.owner.lookup('service:theme');
        assert.ok(service);
    });
});
