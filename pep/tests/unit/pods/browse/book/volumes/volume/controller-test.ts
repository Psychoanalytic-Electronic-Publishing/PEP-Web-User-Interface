import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | browse/book/volumes/volume', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let controller = this.owner.lookup('controller:browse/book/volumes/volume');
    assert.ok(controller);
  });
});
