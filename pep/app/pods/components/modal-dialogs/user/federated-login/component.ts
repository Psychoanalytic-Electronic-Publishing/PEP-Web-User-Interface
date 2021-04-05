import Component from '@glint/environment-ember-loose/glimmer-component';

import { FederatedLoginArgs } from 'pep/services/auth';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsUserFederatedLoginArgs {
    onClose: () => void;
    options: FederatedLoginArgs;
}

export default class ModalDialogsUserFederatedLogin extends Component<
    BaseGlimmerSignature<ModalDialogsUserFederatedLoginArgs>
> {}
