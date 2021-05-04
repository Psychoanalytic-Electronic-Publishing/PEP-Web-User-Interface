import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | browse/book/volumes/index', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:browse/book/volumes/index');
    assert.ok(route);
  });
});
