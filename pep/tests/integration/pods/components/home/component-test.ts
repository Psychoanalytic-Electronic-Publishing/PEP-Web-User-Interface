import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | home', function(hooks) {
    setupRenderingTest(hooks);

    hooks.beforeEach(function() {
        // fixes issue with the component accessing router.urlFor() in its did-insert
        this.owner.lookup('router:main').setupRouter();
    });

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });

        await render(hbs`{{home}}`);

        assert.ok(this.element.textContent);
    });
});
