import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import AuthService from 'pep/services/auth';

interface InformationBarBarsSettingsAuthArgs {
    close: () => void;
}
export default class InformationBarBarsSettingsAuth extends Component<InformationBarBarsSettingsAuthArgs> {
    @service auth!: AuthService;

    @action
    login() {
        this.args.close();
        this.auth.openLoginModal(true, { closeOpenModal: true });
    }
}
