import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | search/read', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:search/read');
        assert.ok(route);
    });
});
