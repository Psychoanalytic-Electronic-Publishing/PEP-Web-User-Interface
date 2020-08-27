import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | most-cited', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:most-cited');
    assert.ok(route);
  });
});
