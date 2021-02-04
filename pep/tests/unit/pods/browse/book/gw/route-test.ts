import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | browse/book/gw', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:browse/book/gw');
        assert.ok(route);
    });
});
