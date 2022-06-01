import Modifier from 'ember-modifier';

type PositionalArgs = [];
type NamedArgs = { onEnter?: () => void; onExit?: () => void };

export interface InViewportSignature {
    Element: HTMLElement;
    Args: {
        Positional: PositionalArgs;
        Named: NamedArgs;
    };
}

export default class InViewportModifier extends Modifier<InViewportSignature> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'in-viewport': typeof InViewportModifier;
    }
}
