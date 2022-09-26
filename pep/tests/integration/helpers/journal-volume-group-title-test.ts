import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Helper | journal-volume-group-title', function (hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it renders', async function (assert) {
        this.set('inputValue', '1234');

        await render(hbs`{{journal-volume-group-title inputValue}}`);

        assert.equal(this.element.textContent?.trim(), '1234');
    });
});
