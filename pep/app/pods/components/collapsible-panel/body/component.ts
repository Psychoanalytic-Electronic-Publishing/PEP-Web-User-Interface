import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface CollapsiblePanelBodyArgs {
    isOpen: boolean;
    transition: Generator<never, void, unknown>;
    animateDuration: number;
}

export default class CollapsiblePanelBody extends Component<BaseGlimmerSignature<CollapsiblePanelBodyArgs>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'CollapsiblePanel::Body': typeof CollapsiblePanelBody;
    }
}
