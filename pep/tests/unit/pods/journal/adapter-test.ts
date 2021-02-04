import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Adapter | journal', function(hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function(assert) {
        const adapter = this.owner.lookup('adapter:journal');
        assert.ok(adapter);
    });
});
