import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | modal-dialogs/admin/admin-specified-information', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Template block usage:
        await render(hbs`
      {{#modal-dialogs/admin/admin-specified-information}}
        template block text
      {{/modal-dialogs/admin/admin-specified-information}}
    `);

        assert.equal(this.element.textContent?.trim(), 'template block text');
    });
});
