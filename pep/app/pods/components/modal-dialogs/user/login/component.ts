import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import Modal from '@gavant/ember-modals/services/modal';
import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { FORGOT_PW_URL } from 'pep/constants/urls';
import AjaxService from 'pep/services/ajax';
import { FederatedLoginArgs, LoginForm } from 'pep/services/auth';
import CurrentUserService from 'pep/services/current-user';
import LoadingBar from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/session';
import { reject } from 'rsvp';

interface ModalDialogsUserLoginArgs {
    onClose: () => void;
    options: {
        changeset: any;
        onAuthenticated: (response: any) => void;
    } & FederatedLoginArgs;
}

export default class ModalDialogsUserLogin extends Component<ModalDialogsUserLoginArgs> {
    @service session!: PepSessionService;
    @service router!: RouterService;
    @service loadingBar!: LoadingBar;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service modal!: Modal;
    @service ajax!: AjaxService;
    @service currentUser!: CurrentUserService;

    @tracked loginError = null;

    /**
     * Forgot password url. We use the FP URL from the api, and then the hardcoded one as a backup
     *
     * @readonly
     * @memberof ModalDialogsUserLogin
     */
    get forgotPasswordUrl() {
        return this.args.options.padsForgotPasswordUrl ?? FORGOT_PW_URL;
    }

    /**
     * Submits the login dialog form and logs the user in
     * @param {GenericChangeset<LoginForm>} changeset
     */
    @action
    async login(changeset: GenericChangeset<LoginForm>) {
        try {
            const username = changeset.username;
            const password = changeset.password;
            this.loadingBar.show();
            const response = await this.session.authenticate('authenticator:credentials', username, password);
            this.loginError = null;
            this.loadingBar.hide();
            this.args.onClose();
            this.notifications.success(this.intl.t('login.success'));
            await this.args.options.onAuthenticated?.(response);
            return response;
        } catch (err) {
            this.loginError = err;
            this.loadingBar.hide();
            return reject(err);
        }
    }

    /**
     * Transitions to a subscribe/register page
     * TODO this is just a placeholder, will eventually change or be removed completely
     * @param {Event} event
     */
    @action
    async transitionToSubscribe(event: Event) {
        event.preventDefault();
        await this.args.onClose();
        //TODO go to real subscribe page
        return this.router.transitionTo('index');
    }

    /**
     * Show the federated login modal
     *
     * @memberof ModalDialogsUserLogin
     */
    @action
    async showFederatedLogins() {
        this.modal.open('user/federated-login', {
            logins: this.args.options.logins,
            genericLoginUrl: this.args.options.genericLoginUrl,
            padsLoginUrl: this.args.options.padsLoginUrl,
            padsForgotPasswordUrl: this.args.options.padsForgotPasswordUrl
        });
        this.args.onClose();
    }
}
