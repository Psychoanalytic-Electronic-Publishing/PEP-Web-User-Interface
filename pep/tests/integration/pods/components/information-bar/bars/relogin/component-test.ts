import { render } from '@ember/test-helpers';

import { setupIntl, t } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';

import hbs from 'htmlbars-inline-precompile';
import { module, test } from 'qunit';

module('Integration | Component | information-bar/bars/relogin', function(hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks);

    test('it renders', async function(assert) {
        // Set any properties with this.set('myProperty', 'value');
        // Handle any actions with this.set('myAction', function(val) { ... });

        await render(hbs`<InformationBar::Bars::Relogin />`);
        assert
            .dom()
            .hasText(
                't:informationBars.relogin.title:() t:informationBars.relogin.buttons.signIn:() t:common.cancel:()'
            );
    });
});
