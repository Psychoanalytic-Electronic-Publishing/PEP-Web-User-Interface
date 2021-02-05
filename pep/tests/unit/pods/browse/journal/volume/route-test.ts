import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | browse/journal/volume', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:browse/journal/volume');
        assert.ok(route);
    });
});
