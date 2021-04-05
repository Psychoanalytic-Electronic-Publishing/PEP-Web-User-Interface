import Component from '@glint/environment-ember-loose/glimmer-component';

import { GlintTemporaryTypeFix } from 'pep/utils/types';

interface InformationBarMessageArgs {
    message?: string;
    close?: () => void;
}

export interface BaseGlimmerSignature {
    Element: HTMLElement;
    Args: GlintTemporaryTypeFix<InformationBarMessageArgs>;
}

export default class InformationBarMessage extends Component<BaseGlimmerSignature> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'InformationBar::Message': typeof InformationBarMessage;
    }
}
