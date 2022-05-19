import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { WIDGET } from 'pep/constants/sidebar';

module('Integration | Component | page/sidebar/widgets/who-cited-this', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('openWidgets', []);
        this.set('data', { [WIDGET.WHO_CITED_THIS]: { id: 1 } });
        await render(hbs`{{page/sidebar/widgets/who-cited-this openWidgets=openWidgets data=data}}`);

        assert.dom('h5').exists({ count: 1 });
    });
});
