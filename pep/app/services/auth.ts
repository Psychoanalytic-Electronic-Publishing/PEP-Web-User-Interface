import Service from '@ember/service';
// import { isNone } from '@ember/utils';
// import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import SessionService from 'ember-simple-auth/services/session';
import ModalService from '@gavant/ember-modals/services/modal';
import createChangeset from '@gavant/ember-validations/utilities/create-changeset';
import LoginValidations from 'pep/validations/user/login';

export default class Auth extends Service {
    @service session!: SessionService;
    @service modal!: ModalService;

    dontRedirectOnLogin = false;

    openLoginModal(dontRedirectOnLogin = false, modalOptions = {}) {
        const changeset = createChangeset({ username: null, password: null }, LoginValidations);
        this.dontRedirectOnLogin = dontRedirectOnLogin;
        this.modal.open('user/login', { ...modalOptions, changeset });
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        auth: Auth;
    }
}
