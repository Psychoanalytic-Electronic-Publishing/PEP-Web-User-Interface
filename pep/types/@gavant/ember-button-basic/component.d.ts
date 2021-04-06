import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

import type { ButtonArgs } from '@gavant/ember-button-basic/components/button';
export declare class ButtonComponent extends Component<BaseGlimmerSignature<ButtonArgs>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        Button: typeof ButtonComponent;
    }
}
