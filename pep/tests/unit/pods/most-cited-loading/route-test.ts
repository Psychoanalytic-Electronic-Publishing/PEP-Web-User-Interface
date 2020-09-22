import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | most-cited-loading', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:most-cited-loading');
    assert.ok(route);
  });
});
