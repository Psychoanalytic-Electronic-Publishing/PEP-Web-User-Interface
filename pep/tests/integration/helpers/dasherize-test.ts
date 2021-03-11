import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Helper | dasherize', function(hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it renders', async function(assert) {
        this.set('inputValue', 'muchWow');

        await render(hbs`{{dasherize inputValue}}`);

        assert.equal(this.element.textContent?.trim(), 'much-wow');
    });
});
