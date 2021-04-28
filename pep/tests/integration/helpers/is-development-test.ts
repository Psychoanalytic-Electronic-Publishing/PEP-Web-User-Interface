import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Helper | is-development', function(hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it renders', async function(assert) {
        this.set('inputValue', 'development');

        await render(hbs`{{is-development inputValue}}`);

        assert.equal(this.element.textContent?.trim(), 'false');
    });
});
