import Component from '@glimmer/component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface LoadingWidgetArgs {
    options?: {
        numLines?: number;
    };
}

export default class LoadingWidget extends Component<BaseGlimmerSignature<LoadingWidgetArgs>> {
    get numLines() {
        return this.args.options?.numLines ?? 3;
    }
}
