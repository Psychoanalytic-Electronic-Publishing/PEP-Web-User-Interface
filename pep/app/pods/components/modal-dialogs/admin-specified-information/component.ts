import Component from '@glimmer/component';

import { AdminSpecifiedInformation } from 'pep/constants/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsAdminSpecifiedInformationArgs {
    onClose: () => void;
    options: {
        information: AdminSpecifiedInformation;
    };
}

export default class ModalDialogsAdminSpecifiedInformation extends Component<
    BaseGlimmerSignature<ModalDialogsAdminSpecifiedInformationArgs>
> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'ModalDialogs::AdminSpecifiedInformation': typeof ModalDialogsAdminSpecifiedInformation;
    }
}
