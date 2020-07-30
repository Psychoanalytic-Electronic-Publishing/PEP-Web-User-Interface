import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { reject } from 'rsvp';
import RouterService from '@ember/routing/router-service';
import SessionService from 'ember-simple-auth/services/session';
import { BufferedChangeset } from 'ember-changeset/types';
import LoadingBar from 'pep/services/loading-bar';

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

    @tracked loginError = null;

    /**
     * Submits the login dialog form and logs the user in
     * @param {BufferedChangeset} changeset
     */
    @action
    async login(changeset: BufferedChangeset) {
        try {
            //TODO eventually want to improve our ember-changesets typing story
            //e.g. be able to do `changeset: BufferedChangeset<LoginModel>` or
            // `changeset = createChangeset<LoginModel>(model, validations)`
            const username = changeset.username as string;
            const password = changeset.password as string;
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
