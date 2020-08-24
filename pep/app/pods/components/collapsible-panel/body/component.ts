import Component from '@glimmer/component';

interface CollapsiblePanelBodyArgs {
    isOpen: boolean;
    transition: Generator<never, void, unknown>;
    animateDuration: number;
}

export default class CollapsiblePanelBody extends Component<CollapsiblePanelBodyArgs> {}
