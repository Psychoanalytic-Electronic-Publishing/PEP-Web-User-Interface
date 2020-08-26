import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import DS from 'ember-data';

import { dontRunInFastboot } from 'pep/decorators/fastboot';
import WhatsNew from 'pep/pods/whats-new/model';
import { WIDGET } from 'pep/constants/sidebar';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import Modal from '@gavant/ember-modals/services/modal';

interface PageSidebarWidgetsWhatsNewArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsWhatsNew extends Component<PageSidebarWidgetsWhatsNewArgs> {
    @service store!: DS.Store;
    @service modal!: Modal;

    @tracked isLoading = false;
    @tracked results: WhatsNew[] = [];

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.WHATS_NEW;

    /**
     * Load the widget results data
     */
    @dontRunInFastboot
    async loadResults() {
        // TODO switch to ember-concurrency task (with TS-friendly decorators, etc)
        // to remove manual `isLoading` state management etc
        // @see https://jamescdavis.com/using-ember-concurrency-with-typescript/
        try {
            this.isLoading = true;
            const results = await this.store.query('whats-new', { days_back: 30, limit: 10 });
            this.results = results.toArray();
            this.isLoading = false;
        } catch (err) {
            this.isLoading = false;
        }
    }

    /**
     * Load the widget results on render
     */
    @action
    onElementInsert() {
        this.loadResults();
    }

    /**
     * Open modal for subscribing to emails
     *
     * @param {Event} event
     * @memberof PageSidebarWidgetsWhatsNew
     */
    @action
    openModal(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        // const model: LoginForm = { username: null, password: null };
        // const changeset = createChangeset<LoginForm>(model, LoginValidations);
        // this.dontRedirectOnLogin = dontRedirectOnLogin;
        this.modal.open('whats-new/subscription', {});
    }
}
