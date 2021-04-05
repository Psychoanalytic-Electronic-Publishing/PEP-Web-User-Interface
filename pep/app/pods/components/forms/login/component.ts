import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import Modal from '@gavant/ember-modals/services/modal';
import createChangeset, { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import AjaxService from 'pep/services/ajax';
import { LoginForm } from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import { BaseGlimmerSignature } from 'pep/utils/types';
import { onAuthenticated } from 'pep/utils/user';
import LoginValidations from 'pep/validations/user/login';
import { reject } from 'rsvp';

interface FormsLoginArgs {
    logins: string;
    padsForgotPasswordUrl: string;
    genericLoginUrl: string;
    padsLoginUrl: string;
    padsRegisterUrl: string;
    isModal?: boolean;
    onClose?: () => void;
}

export default class FormsLogin extends Component<BaseGlimmerSignature<FormsLoginArgs>> {
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;
    @service loadingBar!: LoadingBarService;
    @service('pep-session') session!: PepSessionService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service ajax!: AjaxService;
    @service modal!: Modal;

    @tracked changeset!: GenericChangeset<LoginForm>;
    @tracked loginError = null;

    get cardInfo() {
        return this.configuration.content.global.signInCard;
    }

    /**
     * Create the loginForm changeset.
     * @param {unknown} owner
     * @param {FormsLoginArgs} args
     */
    constructor(owner: unknown, args: FormsLoginArgs) {
        super(owner, args);
        const model: LoginForm = { username: null, password: null };
        const changeset = createChangeset<LoginForm>(model, LoginValidations);
        this.changeset = changeset;
    }

    /**
     * Submits the login form and logs the user in
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
            if (this.args.isModal) {
                this.args.onClose?.();
            }
            this.notifications.success(this.intl.t('login.success'));
            await onAuthenticated(this);
            return response;
        } catch (err) {
            this.loginError = err;
            this.loadingBar.hide();
            return reject(err);
        }
    }

    /**
     * Show the federated login modal
     *
     */
    @action
    async showFederatedLogins() {
        this.modal.open('user/federated-login', {
            logins: this.args.logins,
            genericLoginUrl: this.args.genericLoginUrl,
            padsLoginUrl: this.args.padsLoginUrl,
            padsForgotPasswordUrl: this.args.padsForgotPasswordUrl
        });
    }
}
