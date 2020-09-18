import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | page/sidebar/widgets/favorites', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('openWidgets', []);
        await render(hbs`{{page/sidebar/widgets/favorites openWidgets=openWidgets}}`);

        assert.equal(this.element.textContent?.trim(), 'Favorites');

        // Template block usage:
        await render(hbs`
      {{#page/sidebar/widgets/favorites openWidgets=openWidgets}}
        template block text
      {{/page/sidebar/widgets/favorites}}
    `);

        assert.equal(this.element.textContent?.trim(), 'Favorites');
    });
});
