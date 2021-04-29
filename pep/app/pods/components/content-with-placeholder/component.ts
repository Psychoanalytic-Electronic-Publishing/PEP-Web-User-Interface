import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import IntlService from 'ember-intl/services/intl';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface ContentWithPlaceholderArgs {
    isLoading: boolean;
    placeholderInFastboot?: boolean;
    placeholderComponent?: string;
    options?: object;
}

export default class ContentWithPlaceholder extends Component<BaseGlimmerSignature<ContentWithPlaceholderArgs>> {
    @service fastboot!: FastbootService;
    @service intl!: IntlService;

    get placeholderInFastboot() {
        return this.args.placeholderInFastboot ?? true;
    }

    get placeholderComponent() {
        return this.args.placeholderComponent ?? 'loading/spinner';
    }

    get showPlaceholder() {
        return this.args.isLoading || (this.placeholderInFastboot && this.fastboot.isFastBoot);
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        ContentWithPlaceholder: typeof ContentWithPlaceholder;
        'content-with-placeholder': typeof ContentWithPlaceholder;
    }
}
