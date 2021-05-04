import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import AuthService from 'pep/services/auth';
import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/pep-session';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface InformationBarBarsReloginArgs {
    close: () => void;
}
export default class InformationBarBarsRelogin extends Component<BaseGlimmerSignature<InformationBarBarsReloginArgs>> {
    @service auth!: AuthService;
    @service currentUser!: CurrentUserService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service('pep-session') session!: PepSessionService;

    /**
     * Sets up an auth succeeded event listener to close the information bar
     * @param {unknown} owner
     * @param {SearchFormArgs} args
     */
    constructor(owner: unknown, args: InformationBarBarsReloginArgs) {
        super(owner, args);
        this.session.on('authenticationAndSetupSucceeded', this.onAuthenticationSucceeded);
    }

    /**
     * Removes the auth succeeded event listener on component destroy
     */
    willDestroy() {
        super.willDestroy();
        this.session.off('authenticationAndSetupSucceeded', this.onAuthenticationSucceeded);
    }

    /**
     * On auth succeed, close the information bar
     *
     * @memberof InformationBarBarsSettingsAuth
     */
    @action
    onAuthenticationSucceeded() {
        this.args.close();
    }

    /**
     * Close the information bar and open the login modal
     *
     * @memberof InformationBarBarsSettingsAuth
     */
    @action
    login(): void {
        this.args.close();
        this.auth.openLoginModal(true);
    }

    /**
     * Handle cancel - close the information bar and go to the index route
     *
     * @memberof InformationBarBarsRelogin
     */
    @action
    cancel() {
        this.session.handleInvalidation('/');
        this.args.close();
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'InformationBar::Bars::Relogin': typeof InformationBarBarsRelogin;
    }
}
