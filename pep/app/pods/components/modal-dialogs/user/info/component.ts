import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/pep-session';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsUserInfoArgs {
    onClose: () => void;
}

export default class ModalDialogsUserInfo extends Component<BaseGlimmerSignature<ModalDialogsUserInfoArgs>> {
    @service currentUser!: CurrentUserService;
    @service('pep-session') session!: PepSessionService;

    /**
     * Open the PaDS home-site using the user's generated
     * link in a new tab.
     */
    @action
    openPadsTab() {
        if (this.currentUser.user?.paDSHomeURL) {
            window.open(this.currentUser.user.paDSHomeURL, '_blank');
        }
    }
}
