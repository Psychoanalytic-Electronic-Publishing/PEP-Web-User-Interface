import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | browse/index', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:browse/index');
        assert.ok(route);
    });
});
