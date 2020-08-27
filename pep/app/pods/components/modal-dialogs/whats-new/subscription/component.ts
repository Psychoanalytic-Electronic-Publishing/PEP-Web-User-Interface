import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
import RouterService from '@ember/routing/router-service';
import SessionService from 'ember-simple-auth/services/session';
import NotificationService from 'ember-cli-notifications/services/notifications';
import IntlService from 'ember-intl/services/intl';

import LoadingBar from 'pep/services/loading-bar';
import DS from 'ember-data';

interface ModalDialogsWhatsNewSubscriptionArgs {
    onClose: () => void;
    options: {
        changeset: any;
        onUpdate: (response: any) => void;
    };
}

export default class ModalDialogsWhatsNewSubscription extends Component<ModalDialogsWhatsNewSubscriptionArgs> {
    @service session!: SessionService;
    @service router!: RouterService;
    @service loadingBar!: LoadingBar;
    @service notifications!: NotificationService;
    @service intl!: IntlService;
    @service store!: DS.Store;

    /**
     * Submits the update dialog form
     * TODO this is just a placeholder, will eventually be filled in
     * @param {ModelChangeset<LoginForm>} changeset
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
