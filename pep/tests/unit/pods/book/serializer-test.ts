import { run } from '@ember/runloop';

import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Serializer | book', function(hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function(assert) {
        const store = this.owner.lookup('service:store');
        const serializer = store.serializerFor('book');

        assert.ok(serializer);
    });

    test('it serializes records', function(assert) {
        const store = this.owner.lookup('service:store');
        const record = run(() => store.createRecord('book', {}));

        const serializedRecord = record.serialize();

        assert.ok(serializedRecord);
    });
});
