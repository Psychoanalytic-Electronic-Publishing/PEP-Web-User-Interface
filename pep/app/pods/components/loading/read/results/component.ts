import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface LoadingReadResultsArgs {}

export default class LoadingReadResults extends Component<BaseGlimmerSignature<LoadingReadResultsArgs>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'Loading::Read::Results': typeof LoadingReadResults;
    }
}
