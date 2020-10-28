import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | modal-dialogs/document/image', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });

        await render(hbs`{{modal-dialogs/document/image}}`);

        assert.equal(this.element.textContent?.trim(), '');

        // Template block usage:
        await render(hbs`
      {{#modal-dialogs/document/image}}
        template block text
      {{/modal-dialogs/document/image}}
    `);

        assert.equal(this.element.textContent?.trim(), 'template block text');
    });
});
