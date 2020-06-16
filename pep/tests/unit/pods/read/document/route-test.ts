import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | read/document', function(hooks) {
    setupTest(hooks);

    test('it exists', function(assert) {
        let route = this.owner.lookup('route:read/document');
        assert.ok(route);
    });
});
