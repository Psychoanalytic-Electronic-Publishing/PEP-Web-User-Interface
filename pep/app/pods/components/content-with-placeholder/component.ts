import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import Intl from 'ember-intl/services/intl';

interface ContentWithPlaceholderArgs {
    isLoading: boolean;
    placeholderInFastboot?: boolean;
    placeholderComponent?: string;
    options?: object;
}

export default class ContentWithPlaceholder extends Component<ContentWithPlaceholderArgs> {
    @service fastboot!: FastbootService;
    @service intl!: Intl;

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
