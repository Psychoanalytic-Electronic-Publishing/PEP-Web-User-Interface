import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/session';

interface ModalDialogsUserInfoArgs {
    onClose: () => void;
}

export default class ModalDialogsUserInfo extends Component<ModalDialogsUserInfoArgs> {
    @service currentUser!: CurrentUserService;
    @service session!: PepSessionService;

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
