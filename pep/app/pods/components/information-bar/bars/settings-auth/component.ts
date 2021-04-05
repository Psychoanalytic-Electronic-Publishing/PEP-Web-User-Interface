import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import AuthService from 'pep/services/auth';
import CurrentUserService from 'pep/services/current-user';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface InformationBarBarsSettingsAuthArgs {
    close: () => void;
}
export default class InformationBarBarsSettingsAuth extends Component<
    BaseGlimmerSignature<InformationBarBarsSettingsAuthArgs>
> {
    @service auth!: AuthService;
    @service currentUser!: CurrentUserService;
    @service notifications!: NotificationService;
    @service intl!: IntlService;

    /**
     * Close the information bar and open the login modal
     *
     * @memberof InformationBarBarsSettingsAuth
     */
    @action
    login(): void {
        this.args.close();
        this.auth.openLoginModal(true, {
            closeOpenModal: true
        });
    }
}
