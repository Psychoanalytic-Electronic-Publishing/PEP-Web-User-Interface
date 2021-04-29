import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import IntlService from 'ember-intl/services/intl';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface TranslationWithOptionsArgs {
    path: string;
    options: object;
}

export default class TranslationWithOptions extends Component<BaseGlimmerSignature<TranslationWithOptionsArgs>> {
    @service intl!: IntlService;

    /**
     * Generated the tranlated message using the key and options. This allows you to pass in components like font awesome icons
     *
     * @readonly
     * @memberof TranslationWithOptions
     */
    get tokens() {
        const translation = this.intl.lookup(this.args.path);
        if (translation) {
            return this.intl.formatMessage(translation, this.args.options ?? {});
        } else {
            return '';
        }
    }
}
