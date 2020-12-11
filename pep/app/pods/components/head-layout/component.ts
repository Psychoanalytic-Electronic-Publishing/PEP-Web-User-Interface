import { inject as service } from '@ember/service';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import HeadLayout from 'ember-cli-head/components/head-layout';

export default class HeadLayoutTest extends HeadLayout {
    @service fastboot!: FastbootService;
    shouldTearDownOnInit = false;
}
