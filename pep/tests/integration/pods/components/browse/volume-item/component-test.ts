import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | browse/volume-item', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });

        await render(hbs`{{browse/volume-item}}`);

        assert.equal(this.element.textContent?.trim(), '');

        // Template block usage:
        await render(hbs`
      {{#browse/volume-item}}
        template block text
      {{/browse/volume-item}}
    `);

        assert.equal(this.element.textContent?.trim(), 'template block text');
    });
});
