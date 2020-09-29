import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | page/sidebar/widgets/relevant-searches', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('openWidgets', []);
        await render(hbs`<Page::Sidebar::Widgets::RelevantSearches @openWidgets{{this.openWidgets}} />`);

        assert.equal(this.element.textContent?.trim(), 'Relevant searches');

        // Template block usage:
        await render(hbs`
        <Page::Sidebar::Widgets::RelevantSearches @openWidgets{{this.openWidgets}} >
        template block text
        </Page::Sidebar::Widgets::RelevantSearches>
    `);

        assert.equal(this.element.textContent?.trim(), 'Relevant searches');
    });
});
