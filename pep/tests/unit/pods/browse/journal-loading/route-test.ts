import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | browse/journal-loading', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:browse/journal-loading');
        assert.ok(route);
    });
});
