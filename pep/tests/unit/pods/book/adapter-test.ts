import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Adapter | book', function(hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function(assert) {
        const adapter = this.owner.lookup('adapter:book');
        assert.ok(adapter);
    });
});
