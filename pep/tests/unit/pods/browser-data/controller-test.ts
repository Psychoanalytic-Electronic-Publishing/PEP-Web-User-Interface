import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | browser-data', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:browser-data');
    assert.ok(controller);
  });
});
