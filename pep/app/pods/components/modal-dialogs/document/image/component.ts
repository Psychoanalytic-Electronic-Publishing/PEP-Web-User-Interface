import Component from '@glint/environment-ember-loose/glimmer-component';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsDocumentImageArgs {
    onClose: () => void;
    options: {
        id?: string;
        url: string;
        caption: string;
    };
}

export default class ModalDialogsDocumentImage extends Component<BaseGlimmerSignature<ModalDialogsDocumentImageArgs>> {}
