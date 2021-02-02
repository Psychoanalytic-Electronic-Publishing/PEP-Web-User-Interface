import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import IntlService from 'ember-intl/services/intl';

interface TranslationWithOptionsArgs {
    path: string;
    options: object;
}

export default class TranslationWithOptions extends Component<TranslationWithOptionsArgs> {
    @service intl!: IntlService;

    get tokens() {
        const translation = this.intl.lookup(this.args.path);
        if (translation) {
            return this.intl.formatMessage(translation, this.args.options ?? {});
        } else {
            return '';
        }
    }
}
