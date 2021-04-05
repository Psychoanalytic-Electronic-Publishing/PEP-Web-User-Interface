import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import NotificationService from 'ember-cli-notifications/services/notifications';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import IntlService from 'ember-intl/services/intl';

import Modal from '@gavant/ember-modals/services/modal';
import createChangeset, { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import ENV from 'pep/config/environment';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import AjaxService from 'pep/services/ajax';
import { FederatedLoginResponse, LoginForm } from 'pep/services/auth';
import ConfigurationService from 'pep/services/configuration';
import CurrentUserService from 'pep/services/current-user';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import { BaseGlimmerSignature } from 'pep/utils/types';
import { serializeQueryParams } from 'pep/utils/url';
import { onAuthenticated } from 'pep/utils/user';
import LoginValidations from 'pep/validations/user/login';
import { reject } from 'rsvp';

interface PageSidebarWidgetsSignInArgs {}

export default class PageSidebarWidgetsSignIn extends Component<BaseGlimmerSignature<PageSidebarWidgetsSignInArgs>> {
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
        taskFor(this.loadResults).perform();
    }
}
