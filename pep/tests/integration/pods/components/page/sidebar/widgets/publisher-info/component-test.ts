import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | page/sidebar/widgets/publisher-info', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('openWidgets', []);
        await render(hbs`{{page/sidebar/widgets/publisher-info openWidgets=openWidgets}}`);

        assert.equal(this.element.textContent?.trim(), 'Publisher Info');

        // Template block usage:
        await render(hbs`
      {{#page/sidebar/widgets/publisher-info openWidgets=openWidgets}}
        template block text
      {{/page/sidebar/widgets/publisher-info}}
    `);

        assert.equal(this.element.textContent?.trim(), 'Publisher Info');
    });
});
