import Component from '@glint/environment-ember-loose/glimmer-component';

import type { ButtonArgs } from '@gavant/ember-button-basic/components/button';

interface ButtonComponentArgs extends ButtonArgs {
  [key: string]: unknown
}

export interface ButtonComponentSignature {
    Element: HTMLButtonElement;
    Args: ButtonComponentArgs;
    Yields: {
        default?: [unknown];
    };
}

export declare class ButtonComponent extends Component<ButtonComponentSignature> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        Button: typeof ButtonComponent;
    }
}
