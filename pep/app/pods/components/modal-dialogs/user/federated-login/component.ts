import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import { FORGOT_PW_URL } from 'pep/constants/urls';
import { FederatedLoginArgs } from 'pep/services/auth';
import LoadingBar from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';

interface ModalDialogsFederatedLoginArgs {
    onClose: () => void;
    options: FederatedLoginArgs;
}

export default class ModalDialogsUserLogin extends Component<ModalDialogsFederatedLoginArgs> {
    @service('pep-session') session!: PepSessionService;
    @service router!: RouterService;
    @service loadingBar!: LoadingBar;
    @service notifications!: NotificationService;
    @service intl!: IntlService;

    @tracked loginError = null;

    forgotPasswordUrl = FORGOT_PW_URL;
}
