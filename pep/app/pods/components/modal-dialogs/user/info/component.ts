import CurrentUserService from 'pep/services/current-user';

import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import PepSessionService from 'pep/services/pep-session';

interface ModalDialogsUserInfoArgs {
    onClose: () => void;
}

export default class ModalDialogsUserInfo extends Component<ModalDialogsUserInfoArgs> {
    @service currentUser!: CurrentUserService;
    @service('pep-session') session!: PepSessionService;

    /**
     * Open the PaDS home-site using the user's generated
     * link in a new tab.
     */
    @action
    openPadsTab() {
        window.open(this.currentUser.user!.paDSHomeURL, '_blank');
    }
}
