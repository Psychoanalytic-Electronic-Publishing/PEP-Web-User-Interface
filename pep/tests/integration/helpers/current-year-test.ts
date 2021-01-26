import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Helper | current-year', function(hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it renders', async function(assert) {
        await render(hbs`{{current-year}}`);

        assert.equal(this.element.textContent?.trim(), `${new Date().getFullYear()}`);
    });
});
