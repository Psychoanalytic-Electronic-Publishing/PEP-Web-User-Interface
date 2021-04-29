import Component from '@glint/environment-ember-loose/glimmer-component';

import { Publisher } from 'pep/constants/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsPublisherInfoArgs {
    onClose: () => void;
    options: {
        model: Publisher;
    };
}

export default class ModalDialogsPublisherInfo extends Component<BaseGlimmerSignature<ModalDialogsPublisherInfoArgs>> {}
