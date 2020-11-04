import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import Modal from '@gavant/ember-modals/services/modal';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import DS from 'ember-data';

import { WIDGET } from 'pep/constants/sidebar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import WhatsNew from 'pep/pods/whats-new/model';
import ConfigurationService from 'pep/services/configuration';

interface PageSidebarWidgetsWhatsNewArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsWhatsNew extends Component<PageSidebarWidgetsWhatsNewArgs> {
    @service configuration!: ConfigurationService;
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
    @restartableTask
    *loadResults() {
        const results = yield this.store.query('whats-new', {
            days_back: 30,
            limit: this.configuration.base.global.cards.whatsNew.limit
        });
        this.results = results.toArray();
    }

    /**
     * Load the widget results on render
     *
     * @memberof PageSidebarWidgetsWhatsNew
     */
    @action
    @dontRunInFastboot
    onElementInsert() {
        setTimeout(() => {
            taskFor(this.loadResults).perform();
        }, 1000);
    }

    /**
     * Open modal for subscribing to emails
     *
     * @memberof PageSidebarWidgetsWhatsNew
     */
    @action
    openModal() {
        this.modal.open('whats-new/subscription', {});
    }
}
