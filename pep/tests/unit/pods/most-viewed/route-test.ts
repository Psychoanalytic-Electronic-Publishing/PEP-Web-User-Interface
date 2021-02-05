import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | most-viewed', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:most-viewed');
        assert.ok(route);
    });
});
