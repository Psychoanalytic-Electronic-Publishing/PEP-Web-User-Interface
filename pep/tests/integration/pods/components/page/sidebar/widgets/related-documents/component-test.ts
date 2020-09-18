import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | page/sidebar/widgets/related-documents', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('openWidgets', []);
        this.set('data', {});

        await render(
            hbs`<Page::Sidebar::Widgets::RelatedDocuments @openWidgets{{this.openWidgets}} @data={{this.data}} />`
        );

        assert.equal(this.element.textContent?.trim(), 'Related Documents');

        // Template block usage:
        await render(hbs`
        <Page::Sidebar::Widgets::RelatedDocuments @openWidgets{{this.openWidgets}} @data={{this.data}}>
        template block text
        </Page::Sidebar::Widgets::RelatedDocuments>
    `);

        assert.equal(this.element.textContent?.trim(), 'Related Documents');
    });
});
