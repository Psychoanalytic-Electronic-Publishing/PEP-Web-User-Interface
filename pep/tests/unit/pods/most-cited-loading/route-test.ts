import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | most-cited-loading', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:most-cited-loading');
        assert.ok(route);
    });
});
