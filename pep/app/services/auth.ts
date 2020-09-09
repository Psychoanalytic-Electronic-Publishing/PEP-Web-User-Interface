import Service from '@ember/service';
import { inject as service } from '@ember/service';
import ModalService from '@gavant/ember-modals/services/modal';
import createChangeset from '@gavant/ember-validations/utilities/create-changeset';

import LoginValidations from 'pep/validations/user/login';
import PepSessionService from 'pep/services/pep-session';

export interface LoginForm {
    username: string | null;
    password: string | null;
}

export default class AuthService extends Service {
    @service('pep-session') session!: PepSessionService;
    @service modal!: ModalService;

    dontRedirectOnLogin = false;

    /**
     * Opens the login modal dialog
     * @param {Boolean} dontRedirectOnLogin
     * @param {Object} modalOptions
     */
    openLoginModal(dontRedirectOnLogin = false, modalOptions = {}) {
        const model: LoginForm = { username: null, password: null };
        const changeset = createChangeset<LoginForm>(model, LoginValidations);
        this.dontRedirectOnLogin = dontRedirectOnLogin;
        this.modal.open('user/login', { ...modalOptions, changeset });
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        auth: AuthService;
    }
}
