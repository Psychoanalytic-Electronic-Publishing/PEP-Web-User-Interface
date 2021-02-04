import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | browse', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:browse');
        assert.ok(route);
    });
});
