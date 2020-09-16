import Component from '@glimmer/component';

interface ModalDialogsPublisherInfoArgs {
    onClose: () => void;
    options: {
        model: {
            sourceCode: string;
            previewHTML: string;
            fullHTML: string;
        };
    };
}

export default class ModalDialogsPublisherInfo extends Component<ModalDialogsPublisherInfoArgs> {}
