// modal-dialogs/taylor-francis-subscription.ts
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Cookies from 'ember-cookies/services/cookies';
import { COOKIE_PATH, HIDE_TF_PROMO_COOKIE_NAME } from 'pep/constants/cookies';

interface ModalDialogsUserInfoArgs {
    onClose: () => void;
}

export default class TFPSubscriptionModal extends Component<ModalDialogsUserInfoArgs> {
    @service declare cookies: Cookies;

    @action
    async close() {
        this.cookies.write(HIDE_TF_PROMO_COOKIE_NAME, '1', {
            path: COOKIE_PATH,
            expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });

        this.args.onClose();
    }
}
