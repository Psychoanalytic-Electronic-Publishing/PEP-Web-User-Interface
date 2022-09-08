import Component from '@glimmer/component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface LoadingReadDocumentArgs {}

export default class LoadingReadDocument extends Component<BaseGlimmerSignature<LoadingReadDocumentArgs>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Loading::Read::Document': typeof LoadingReadDocument;
    }
}
