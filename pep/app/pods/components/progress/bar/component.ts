import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import LoadingBar from 'pep/services/loading-bar';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface ProgressBarArgs {
    light: boolean;
}

export default class ProgressBar extends Component<BaseGlimmerSignature<ProgressBarArgs>> {
    @service loadingBar!: LoadingBar;

    /**
     * Returns whether or not the loading bar is visible
     *
     * @readonly
     * @type {boolean}
     */
    get isShown(): boolean {
        return this.loadingBar.isShown;
    }

    /**
     * Returns whether or not the loading bar is light
     *
     * @readonly
     * @type {boolean}
     */
    get light(): boolean {
        return this.args.light ?? false;
    }
}
