import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import NotificationService from 'ember-cli-notifications/services/notifications';
import DS from 'ember-data';
import IntlService from 'ember-intl/services/intl';

import LoadingBar from 'pep/services/loading-bar';
import PepSessionService from 'pep/services/pep-session';
import { reject } from 'rsvp';

interface ModalDialogsWhatsNewSubscriptionArgs {
    onClose: () => void;
    options: {
        changeset: any;
        onUpdate: (response: any) => void;
    };
}

export default class ModalDialogsWhatsNewSubscription extends Component<ModalDialogsWhatsNewSubscriptionArgs> {
    @service('pep-session') session!: PepSessionService;
    @service router!: RouterService;
    @service loadingBar!: LoadingBar;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service store!: DS.Store;

    /**
     * Submits the update dialog form
     * TODO this is just a placeholder, will eventually be filled in
     * @param {GenericChangeset<LoginForm>} changeset
     */
    @action
    async update() {
        try {
            this.loadingBar.show();
            const response = await this.store.query('document', {
                queryType: 'MostCited',
                period: 'all',
                morethan: 10,
                limit: 10
            });
            return response;
        } catch (err) {
            this.loadingBar.hide();
            return reject(err);
        }
    }
}
