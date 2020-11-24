import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | browse/tab', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Template block usage:
        await render(hbs`
      {{#browse/tab}}
        template block text
      {{/browse/tab}}
    `);

        assert.equal(this.element.textContent?.trim(), 'template block text');
    });
});
