import Component from '@glimmer/component';
import { Publisher } from 'pep/constants/configuration';

interface ModalDialogsPublisherInfoArgs {
    onClose: () => void;
    options: {
        model: Publisher;
    };
}

export default class ModalDialogsPublisherInfo extends Component<ModalDialogsPublisherInfoArgs> {}
