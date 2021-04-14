import Component, { ArgsFor } from '@glint/environment-ember-loose/ember-component';

declare module 'ember-animated' {
    export interface Sprite {
        startAtPixel: (options: { y: number }) => void;
        endAtPixel: (options: { y: number }) => void;
        startTranslatedBy: (dx: number, dy: number) => void;
        endTranslatedBy: (dx: number, dy: number) => void;
    }

    export interface TransitionArgs {
        keptSprites: Sprite[];
        removedSprites: Sprite[];
        insertedSprites: Sprite[];
    }

    export interface ContainerArgs {}
    export interface ContainerSignature {
        args: ContainerArgs;
        Yields: {
            default?: [void];
        };
    }
    export interface AnimatedContainer extends ArgsFor<ContainerSignature> {}
    export class AnimatedContainer extends Component<ContainerSignature> {}

    export interface AnimatedIfArgs {
        predicate: boolean;
        use: any;
        duration: any;
        initialInsertion: any;
    }

    export interface AnimatedIfSignature {
        args: AnimatedIfArgs;
        Yields: {
            default?: [void];
            inverse?: [];
        };
    }
    export interface AnimatedIf extends ArgsFor<AnimatedIfSignature> {}
    export class AnimatedIf extends Component<AnimatedIfSignature> {}
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        AnimatedContainer: typeof AnimatedContainer;
        AnimatedIf: typeof AnimatedIf;
        'animated-if': typeof AnimatedIf;
    }
}
