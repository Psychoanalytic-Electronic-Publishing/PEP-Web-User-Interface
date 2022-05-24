import { run } from '@ember/runloop';

import Store from '@ember-data/store';
import { setupTest } from 'ember-qunit';

import { module, test } from 'qunit';

module('Unit | Serializer | source volume', function(hooks) {
    setupTest(hooks);

    // Replace this with your real tests.
    test('it exists', function(assert) {
        const store = this.owner.lookup('service:store') as Store;
        const serializer = store.serializerFor('source-volume');

        assert.ok(serializer);
    });

    test('it serializes records', function(assert) {
        const store = this.owner.lookup('service:store') as Store;
        const record = run(() => store.createRecord('source-volume', {}));

        const serializedRecord = record.serialize();

        assert.ok(serializedRecord);
    });
});
