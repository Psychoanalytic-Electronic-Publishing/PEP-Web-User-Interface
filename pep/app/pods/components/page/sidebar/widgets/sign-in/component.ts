import NotificationService from 'ember-cli-notifications/services/notifications';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import IntlService from 'ember-intl/services/intl';
import ENV from 'pep/config/environment';
import { FORGOT_PW_URL } from 'pep/constants/urls';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import AjaxService from 'pep/services/ajax';
import { FederatedLoginResponse, LoginForm } from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/session';
import { serializeQueryParams } from 'pep/utils/url';
import LoginValidations from 'pep/validations/user/login';
import { reject } from 'rsvp';

import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import createChangeset, { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Modal from '@gavant/ember-modals/services/modal';
import { onAuthenticated } from 'pep/utils/user';

interface PageSidebarWidgetsSignInArgs {}

export default class PageSidebarWidgetsSignIn extends Component<PageSidebarWidgetsSignInArgs> {
    @service configuration!: ConfigurationService;
    @service currentUser!: CurrentUserService;
    @service loadingBar!: LoadingBarService;
    @service session!: PepSessionService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service ajax!: AjaxService;
    @service modal!: Modal;

    @tracked changeset!: GenericChangeset<LoginForm>;
    @tracked loginError = null;
    @tracked logins = null;
    @tracked padsForgotPasswordUrl = null;
    @tracked genericLoginUrl = null;
    @tracked padsLoginUrl = null;
    @tracked padsRegisterUrl = null;

    /**
     * Create the loginForm changeset.
     * @param {unknown} owner
     * @param {PageSidebarWidgetsSignInArgs} args
     */
    constructor(owner: unknown, args: PageSidebarWidgetsSignInArgs) {
        super(owner, args);
        const model: LoginForm = { username: null, password: null };
        const changeset = createChangeset<LoginForm>(model, LoginValidations);
        this.changeset = changeset;
    }

    get cardInfo() {
        return this.configuration.content.global.signInCard;
    }

    /**
     * Forgot password url. We use the FP URL from the api, and then the hardcoded one as a backup
     *
     * @readonly
     */
    get forgotPasswordUrl() {
        return this.padsForgotPasswordUrl ?? FORGOT_PW_URL;
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
     * Load the widget login data
     */
    @restartableTask
    *loadResults() {
        const session = this.session.isAuthenticated
            ? this.session.data?.authenticated?.SessionId
            : this.session.getUnauthenticatedSession()?.SessionId;
        const params = serializeQueryParams({
            sessionId: session ?? ''
        });
        const federatedLogins = yield this.ajax.request<FederatedLoginResponse>(`${ENV.federatedLoginUrl}?${params}`, {
            appendTrailingSlash: false
        });
        this.logins = JSON.parse(federatedLogins.FederatedLinks).FederatedLinks;
        this.genericLoginUrl = federatedLogins.GenericFederatedURL;
        this.padsLoginUrl = federatedLogins.PaDSLogonURL;
        this.padsForgotPasswordUrl = federatedLogins.PaDSPasswordResetURL;
        this.padsRegisterUrl = federatedLogins.PaDSRegisterUserURL;
    }

    /**
     * Load the widget results on render
     *
     */
    @action
    @dontRunInFastboot
    onElementInsert() {
        later(() => {
            taskFor(this.loadResults).perform();
        }, 1000);
    }

    /**
     * Show the federated login modal
     *
     */
    @action
    async showFederatedLogins() {
        this.modal.open('user/federated-login', {
            logins: this.logins,
            genericLoginUrl: this.genericLoginUrl,
            padsLoginUrl: this.padsLoginUrl,
            padsForgotPasswordUrl: this.padsForgotPasswordUrl
        });
    }
}
