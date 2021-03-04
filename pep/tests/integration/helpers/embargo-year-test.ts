import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { module, test } from 'qunit';

module('Integration | Helper | embargo-year', function(hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it renders', async function(assert) {
        this.set('inputValue', '1');

        await render(hbs`{{embargo-year inputValue}}`);

        assert.equal(
            this.element.textContent?.trim(),
            moment(new Date())
                .subtract('1', 'years')
                .format('YYYY')
        );
    });
});
