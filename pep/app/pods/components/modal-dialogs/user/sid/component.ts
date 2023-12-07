import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import ENV from 'pep/config/environment';

import CurrentUserService from 'pep/services/current-user';
import PepSessionService from 'pep/services/pep-session';
import AuthService, { FederatedLoginResponse } from 'pep/services/auth';
import { BaseGlimmerSignature } from 'pep/utils/types';
import { serializeQueryParams } from 'pep/utils/url';
import AjaxService from 'pep/services/ajax';
import NotificationService from 'ember-cli-notifications/services/notifications';
import LoadingBarService from 'pep/services/loading-bar';

interface ModalDialogsSidArgs {
    onClose: () => void;
}

export default class ModalDialogsUserInfo extends Component<BaseGlimmerSignature<ModalDialogsSidArgs>> {
    @service currentUser!: CurrentUserService;
    @service('pep-session') session!: PepSessionService;
    @service auth!: AuthService;
    @service ajax!: AjaxService;
    @service notifications!: NotificationService;
    @service loadingBar!: LoadingBarService;

    /**
     * Open the PaDS home-site using the user's generated
     * link in a new tab.
     */
    @action
    async openPadsTab() {
        try {
            this.loadingBar.show();

            const session = this.session.isAuthenticated
                ? this.session.data?.authenticated?.SessionId
                : this.session.getUnauthenticatedSession()?.SessionId;
            const params = serializeQueryParams({
                sessionId: session ?? ''
            });
            const federatedLogins = await this.ajax.request<FederatedLoginResponse>(
                `${ENV.federatedLoginUrl}?${params}`,
                {
                    appendTrailingSlash: false
                }
            );

            if (!federatedLogins.PaDSRegisterUserURL) {
                throw new Error('Could not find PaDS registration URL. Please try again later or contact support.');
            }

            window.location.href = federatedLogins.PaDSRegisterUserURL;
        } catch (errors) {
            this.notifications.error(errors);
        } finally {
            this.loadingBar.hide();
        }
    }
}
