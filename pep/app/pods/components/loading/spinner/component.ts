import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface LoadingSpinnerArgs {
    options: {
        text?: string;
    };
}

export default class LoadingSpinner extends Component<BaseGlimmerSignature<LoadingSpinnerArgs>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Loading::Spinner': typeof LoadingSpinner;
    }
}
