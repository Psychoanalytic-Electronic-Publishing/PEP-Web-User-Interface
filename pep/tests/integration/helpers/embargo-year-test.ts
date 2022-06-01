import { render } from '@ember/test-helpers';

import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { module, test } from 'qunit';

module('Integration | Helper | embargo-year', function (hooks) {
    setupRenderingTest(hooks);

    // Replace this with your real tests.
    test('it renders', async function (assert) {
        this.set('date', '2022-01-01');
        this.set('years', '3');

        await render(hbs`{{embargo-year this.date this.years}}`);

        assert.equal(
            this.element.textContent?.trim(),
            moment(new Date('2022-01-01')).subtract('3', 'years').format('YYYY')
        );
    });
});
