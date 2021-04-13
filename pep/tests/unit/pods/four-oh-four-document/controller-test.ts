import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Controller | four-oh-four-document', function(hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function(assert) {
        const controller = this.owner.lookup('controller:four-oh-four-document');
        assert.ok(controller);
    });
});
