import Component from '@glimmer/component';

interface CollapsiblePanelHeaderArgs {
    title: string;
    secondaryAction?: {
        action: () => void;
        icon: string;
        label: string;
    };
}

export default class CollapsiblePanelHeader extends Component<CollapsiblePanelHeaderArgs> {}
