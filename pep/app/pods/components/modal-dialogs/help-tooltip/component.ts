import Component from '@glimmer/component';

interface ModalDialogsHelpTooltipArgs {
    onClose: () => void;
    options: {
        title?: string;
        content: string;
    };
}

export default class ModalDialogsHelpTooltip extends Component<ModalDialogsHelpTooltipArgs> {}
