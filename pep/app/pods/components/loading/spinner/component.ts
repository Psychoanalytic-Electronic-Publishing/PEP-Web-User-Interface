import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface LoadingSpinnerArgs {
    options: {
        text?: string;
    };
}

export default class LoadingSpinner extends Component<BaseGlimmerSignature<LoadingSpinnerArgs>> {}
