import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
import RouterService from '@ember/routing/router-service';
import SessionService from 'ember-simple-auth/services/session';
import NotificationService from 'ember-cli-notifications/services/notifications';
import { ModelChangeset } from '@gavant/ember-validations/utilities/create-changeset';
import intl from 'ember-intl/services/intl';

import LoadingBar from 'pep/services/loading-bar';
import { LoginForm } from 'pep/services/auth';

interface ModalDialogsUserLoginArgs {
    onClose: () => void;
    options: {
        changeset: any;
        onAuthenticated: (response: any) => void;
    };
}

export default class ModalDialogsUserLogin extends Component<ModalDialogsUserLoginArgs> {
    @service session!: SessionService;
    @service router!: RouterService;
    @service loadingBar!: LoadingBar;
    @service notifications!: NotificationService;
    @service intl!: intl;

    @tracked loginError = null;

    /**
     * Submits the login dialog form and logs the user in
     * @param {ModelChangeset<LoginForm>} changeset
     */
    @action
    async login(changeset: ModelChangeset<LoginForm>) {
        try {
            const username = changeset.username;
            const password = changeset.password;
            this.loadingBar.show();
            const response = await this.session.authenticate('authenticator:pep', username, password);
            this.loginError = null;
            this.loadingBar.hide();
            this.args.onClose();
            this.notifications.success(this.intl.t('login.success'));
            await this.args.options.onAuthenticated?.(response);
            return response;
        } catch (err) {
            this.loginError = err;
            this.loadingBar.hide();
            return reject(err);
        }
    }

    /**
     * Transitions to a subscribe/register page
     * TODO this is just a placeholder, will eventually change or be removed completely
     * @param {Event} event
     */
    @action
    async transitionToSubscribe(event: Event) {
        event.preventDefault();
        await this.args.onClose();
        //TODO go to real subscribe page
        return this.router.transitionTo('index');
    }
}
