import ArrayProxy from '@ember/array/proxy';
import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

import Component from '@glint/environment-ember-loose/glimmer-component';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import DS from 'ember-data';

import Modal from '@gavant/ember-modals/services/modal';

import { WIDGET } from 'pep/constants/sidebar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { BasePageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import WhatsNew from 'pep/pods/whats-new/model';
import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsWhatsNewArgs extends BasePageSidebarWidgetArgs {}

export default class PageSidebarWidgetsWhatsNew extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsWhatsNewArgs>
> {
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
    *loadResults(): Generator<
        DS.AdapterPopulatedRecordArray<WhatsNew> & DS.PromiseArray<WhatsNew, ArrayProxy<WhatsNew>>,
        void,
        DS.AdapterPopulatedRecordArray<WhatsNew>
    > {
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
        later(() => {
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
