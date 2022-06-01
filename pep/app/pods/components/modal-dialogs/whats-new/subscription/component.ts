import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import NotificationService from 'ember-cli-notifications/services/notifications';
import DS from 'ember-data';
import IntlService from 'ember-intl/services/intl';

import CurrentUserService from 'pep/services/current-user';
import LoadingBar from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import { BaseGlimmerSignature } from 'pep/utils/types';
import { reject } from 'rsvp';

interface ModalDialogsWhatsNewSubscriptionArgs {
    onClose: () => void;
    options: {
        changeset: any;
        onUpdate: (response: any) => void;
    };
}

export default class ModalDialogsWhatsNewSubscription extends Component<
    BaseGlimmerSignature<ModalDialogsWhatsNewSubscriptionArgs>
> {
    @service('pep-session') session!: PepSessionService;
    @service router!: RouterService;
    @service loadingBar!: LoadingBar;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service store!: DS.Store;
    @service currentUser!: CurrentUserService;

    @tracked sendJournalAlerts = this.currentUser.user?.sendJournalAlerts;
    @tracked sendVideoAlerts = this.currentUser.user?.sendVideoAlerts;

    /**
     * Update the local status of the alerts
     *
     * @param {('sendJournalAlerts' | 'sendVideoAlerts')} alertName
     * @param {boolean} value
     * @memberof ModalDialogsWhatsNewSubscription
     */
    @action
    updateUserAlerts(alertName: 'sendJournalAlerts' | 'sendVideoAlerts', value: boolean): void {
        this[alertName] = value;
    }

    /**
     * Submits the update dialog form
     * TODO this is just a placeholder, will eventually be filled in
     * @param {GenericChangeset<LoginForm>} changeset
     */
    @action
    async update() {
        try {
            this.loadingBar.show();
            const user = this.currentUser.user;
            if (user) {
                user.sendJournalAlerts = this.sendJournalAlerts ?? false;
                user.sendVideoAlerts = this.sendVideoAlerts ?? false;
            }
            await user?.save();
            this.loadingBar.hide();
            return this.args.onClose();
        } catch (err) {
            this.loadingBar.hide();
            return reject(err);
        }
    }
}
