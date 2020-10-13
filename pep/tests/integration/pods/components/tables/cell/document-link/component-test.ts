import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | tables/cell/document-link', function(hooks) {
    setupRenderingTest(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });
        this.set('rowValue', {});
        this.set('cellValue', 'test');
        this.set('columnValue', {
            onClick: () => {}
        });
        await render(
            hbs`{{tables/cell/document-link rowValue=this.rowValue cellValue=this.cellValue columnValue=this.columnValue}}`
        );

        assert.equal(this.element.textContent?.trim(), 'test');
    });
});
