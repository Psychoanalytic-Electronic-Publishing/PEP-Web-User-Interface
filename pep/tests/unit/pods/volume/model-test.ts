import { run } from '@ember/runloop';

import Store from '@ember-data/store';
import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Model | volume', function(hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function(assert) {
        const store = this.owner.lookup('service:store') as Store;
        const model = run(() => store.createRecord('volume', {}));
        assert.ok(model);
    });
});
