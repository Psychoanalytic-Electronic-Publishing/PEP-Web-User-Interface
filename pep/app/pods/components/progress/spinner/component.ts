import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface ProgressSpinnerArgs {
    active: boolean;
    light?: boolean;
    size?: string;
}

export default class ProgressSpinner extends Component<BaseGlimmerSignature<ProgressSpinnerArgs>> {
    get active() {
        return this.args.active ?? true;
    }
}
