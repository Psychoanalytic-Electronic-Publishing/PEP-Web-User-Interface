import Component from '@glimmer/component';

import { FederatedLoginArgs } from 'pep/services/auth';

interface ModalDialogsUserFederatedLoginArgs {
    onClose: () => void;
    options: FederatedLoginArgs;
}

export default class ModalDialogsUserFederatedLogin extends Component<ModalDialogsUserFederatedLoginArgs> {}
