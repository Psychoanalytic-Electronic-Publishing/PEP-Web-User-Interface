import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pep/config/environment';

import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/pep-session';
import AuthService, { FederatedLoginResponse } from 'pep/services/auth';
import { BaseGlimmerSignature } from 'pep/utils/types';
import { serializeQueryParams } from 'pep/utils/url';
import AjaxService from 'pep/services/ajax';
import ModalService from '@gavant/ember-modals/services/modal';
import NotificationService from 'ember-cli-notifications/services/notifications';
import LoadingBarService from 'pep/services/loading-bar';

interface ModalDialogsSidArgs {
    onClose: () => void;
}

export default class ModalDialogsUserInfo extends Component<BaseGlimmerSignature<ModalDialogsSidArgs>> {
    @service currentUser!: CurrentUserService;
    @service('pep-session') session!: PepSessionService;
    @service auth!: AuthService;
    @service ajax!: AjaxService;
    @service notifications!: NotificationService;
    @service loadingBar!: LoadingBarService;
    @service modal!: ModalService;

    @action openSignIn() {
        this.modal.close();
        return this.auth.openLoginModal();
    }

    /**
     * Open the PaDS home-site using the user's generated
     * link in a new tab.
     */
    @action
    openPadsTab() {
        return this.auth.redirectToRegistration();
    }
}
