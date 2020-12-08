import CurrentUserService from 'pep/services/current-user';

import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

interface ModalDialogsUserInfoArgs {
    onClose: () => void;
}

export default class ModalDialogsUserInfo extends Component<ModalDialogsUserInfoArgs> {
    @service currentUser!: CurrentUserService;
}
