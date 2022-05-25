import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Helper | get-array-index', function(hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it renders', async function(assert) {
        this.set('array', [1, 2, 3]);
        this.set('index', 2);

        await render(hbs`{{get-array-index this.array this.index}}`);

        assert.equal(this.element.textContent?.trim(), 3);
    });
});
