import Component from '@glimmer/component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsHelpTooltipArgs {
    onClose: () => void;
    options: {
        title?: string;
        content: string;
        bodyId: string;
    };
}

export default class ModalDialogsHelpTooltip extends Component<BaseGlimmerSignature<ModalDialogsHelpTooltipArgs>> {}
