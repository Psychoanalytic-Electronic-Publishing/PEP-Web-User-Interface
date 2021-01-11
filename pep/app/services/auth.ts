import Service, { inject as service } from '@ember/service';

import ModalService from '@gavant/ember-modals/services/modal';
import createChangeset from '@gavant/ember-validations/utilities/create-changeset';
import NotificationService from 'ember-cli-notifications/services/notifications';

import ENV from 'pep/config/environment';
import AjaxService from 'pep/services/ajax';
import LoadingBarService from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import LoginValidations from 'pep/validations/user/login';

export interface FederatedLoginResponse {
    FederatedLinks: string;
    GenericFederatedURL: string;
    PaDSLogonURL: string;
    PaDSPasswordResetURL: string;
    ReasonDescription: string;
}
export interface FederatedLoginArgs {
    logins: {
        Name: string;
        URL: string;
    }[];
    genericLoginUrl: string;
    padsLoginUrl: string;
    padsForgotPasswordUrl: string;
}

export interface LoginForm {
    username: string | null;
    password: string | null;
}

export default class AuthService extends Service {
    @service('pep-session') session!: PepSessionService;
    @service ajax!: AjaxService;
    @service modal!: ModalService;
    @service notifications!: NotificationService;
    @service loadingBar!: LoadingBarService;

    dontRedirectOnLogin = false;

    /**
     * Opens the login modal dialog
     * @param {Boolean} dontRedirectOnLogin
     * @param {Object} modalOptions
     */
    async openLoginModal(dontRedirectOnLogin = false, modalOptions = {}) {
        try {
            this.loadingBar.show();
            const model: LoginForm = { username: null, password: null };
            const changeset = createChangeset<LoginForm>(model, LoginValidations);
            this.dontRedirectOnLogin = dontRedirectOnLogin;
            const session = this.session.getUnauthenticatedSession();
            const federatedLogins = await this.ajax.request<FederatedLoginResponse>(
                `${ENV.federatedLoginUrl}?sessionId=${session?.SessionId ?? ''}`,
                {
                    appendTrailingSlash: false
                }
            );
            this.modal.open('user/login', {
                ...modalOptions,
                changeset,
                logins: JSON.parse(federatedLogins.FederatedLinks).FederatedLinks,
                genericLoginUrl: federatedLogins.GenericFederatedURL,
                padsLoginUrl: federatedLogins.PaDSLogonURL,
                padsForgotPasswordUrl: federatedLogins.PaDSPasswordResetURL
            });
        } catch (errors) {
            this.notifications.error(errors);
        } finally {
            this.loadingBar.hide();
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        auth: AuthService;
    }
}
