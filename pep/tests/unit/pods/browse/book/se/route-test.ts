import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | browse/book/se', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:browse/book/se');
        assert.ok(route);
    });
});
