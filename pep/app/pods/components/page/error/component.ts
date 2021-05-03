import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageErrorArgs {
    heading: string;
    subheading: string;
    message: string;
}

export default class PageError extends Component<BaseGlimmerSignature<PageErrorArgs>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        PageError: typeof PageError;
    }
}
