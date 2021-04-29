import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Route | four-oh-four-document', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        const route = this.owner.lookup('route:four-oh-four-document');
        assert.ok(route);
    });
});
