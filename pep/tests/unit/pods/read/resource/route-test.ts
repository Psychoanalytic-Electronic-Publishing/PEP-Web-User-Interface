import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | read/resource', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:read/resource');
    assert.ok(route);
  });
});
