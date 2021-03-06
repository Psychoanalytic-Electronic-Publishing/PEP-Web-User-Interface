import { render } from '@ember/test-helpers';

import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | admin/editor', function(hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('changeset', {
            get() {
                return '';
            }
        });

        await render(hbs`<Admin::Editor @changeset={{this.changeset}} />`);

        assert.equal(this.element.textContent?.trim(), '');
    });
});
