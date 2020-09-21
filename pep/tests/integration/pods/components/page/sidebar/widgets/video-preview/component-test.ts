import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | page/sidebar/widgets/video-preview', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('openWidgets', []);
        await render(hbs`<Page::Sidebar::Widgets::VideoPreview @openWidgets{{this.openWidgets}} />`);

        assert.equal(this.element.textContent?.trim(), 'Latest Video');

        // Template block usage:
        await render(hbs`
        <Page::Sidebar::Widgets::VideoPreview @openWidgets{{this.openWidgets}}>
        </Page::Sidebar::Widgets::VideoPreview>
    `);

        assert.equal(this.element.textContent?.trim(), 'Latest Video');
    });
});
