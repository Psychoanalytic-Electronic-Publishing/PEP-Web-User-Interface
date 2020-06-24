import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action, get } from '@ember/object';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
import RouterService from '@ember/routing/router-service';
import SessionService from 'ember-simple-auth/services/session';
import LoadingBar from 'pep/services/loading-bar';

interface ModalDialogsUserLoginArgs {
    onClose: () => void;
    //TODO
    options: {
        changeset: any;
        onAuthenticated: (response: any) => void;
    };
}

export default class ModalDialogsUserLogin extends Component<ModalDialogsUserLoginArgs> {
    @service session!: SessionService;
    @service router!: RouterService;
    @service loadingBar!: LoadingBar;

    @tracked loginError = null;

    @action
    async login(changeset) {
        try {
            const username = get(changeset, 'username');
            const password = get(changeset, 'password');
            this.loadingBar.show();
            this.loginError = null;
            const response = await this.session.authenticate('authenticator:pep', username, password);
            this.loadingBar.hide();
            this.args.onClose();
            await this.args.options.onAuthenticated?.(response);
            return response;
        } catch (err) {
            this.loginError = err;
            this.loadingBar.hide();
            return reject(err);
        }
    }

    @action
    async transitionToSubscribe(event) {
        event.preventDefault();
        await this.args.onClose();
        //TODO go to real subscribe page
        return this.router.transitionTo('index');
    }
}
