import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

import type { ButtonSpinnerArgs } from '@gavant/ember-button-spinner/components/button-spinner';
export declare class ButtonSpinnerComponent extends Component<BaseGlimmerSignature<ButtonSpinnerArgs>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        ButtonSpinner: typeof ButtonSpinnerComponent;
    }
}
