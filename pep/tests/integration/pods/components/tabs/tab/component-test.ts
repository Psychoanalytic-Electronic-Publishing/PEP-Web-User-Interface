import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | tabs/tab', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('onChange', () => {});
        await render(hbs`{{tabs/tab onChange=onChange}}`);

        assert.equal(this.element.textContent?.trim(), '');

        // Template block usage:
        await render(hbs`
      {{#tabs/tab onChange=onChange}}
        template block text
      {{/tabs/tab}}
    `);

        assert.equal(this.element.textContent?.trim(), 'template block text');
    });
});
