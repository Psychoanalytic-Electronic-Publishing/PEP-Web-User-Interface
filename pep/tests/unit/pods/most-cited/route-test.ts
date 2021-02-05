import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | most-cited', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:most-cited');
        assert.ok(route);
    });
});
