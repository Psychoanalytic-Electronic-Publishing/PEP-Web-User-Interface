import Component from '@glimmer/component';

interface ModalDialogsDocumentImageArgs {
    onClose: () => void;
    options: {
        id?: string;
        url: string;
        caption: string;
    };
}

export default class ModalDialogsDocumentImage extends Component<ModalDialogsDocumentImageArgs> {}
