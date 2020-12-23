import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | search/refine/option', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('option', { id: 1, label: 'Foo', numResults: 7 });
        this.set('selection', []);
        await render(hbs`<Search::Refine::Option @option={{this.option}} @selection={{this.selection}} />`);

        assert.ok(this.element.textContent);
    });
});
