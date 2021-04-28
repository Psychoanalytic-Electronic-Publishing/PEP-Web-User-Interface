import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | modal-dialogs/admin/tour', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('options', {
            changeset: {
                get() {}
            }
        });
        await render(hbs`<ModalDialogs::Admin::Tour @options={{this.options}} />`);

        assert.ok(this.element.textContent?.trim());
    });
});
