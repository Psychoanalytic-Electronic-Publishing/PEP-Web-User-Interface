import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | collapsible-panel/header', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('toggle', () => {});
        await render(hbs`<CollapsiblePanel::Header @toggle={{this.toggle}} />`);

        assert.equal(this.element.textContent?.trim(), '');

        // Template block usage:
        await render(hbs`
        <CollapsiblePanel::Header @toggle={{this.toggle}}>
            {{t "brand.name"}}
        </CollapsiblePanel::Header>
    `);

        assert.ok(this.element.textContent);
    });
});
