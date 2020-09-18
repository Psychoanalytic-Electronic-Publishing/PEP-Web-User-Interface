import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | page/sidebar/widgets/read-later', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('openWidgets', []);
        await render(hbs`{{page/sidebar/widgets/read-later openWidgets=openWidgets}}`);

        assert.equal(this.element.textContent?.trim(), 'Read later');

        // Template block usage:
        await render(hbs`
      {{#page/sidebar/widgets/read-later openWidgets=openWidgets}}
        template block text
      {{/page/sidebar/widgets/read-later}}
    `);

        assert.equal(this.element.textContent?.trim(), 'Read later');
    });
});
