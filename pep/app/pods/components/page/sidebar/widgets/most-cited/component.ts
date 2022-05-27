import ArrayProxy from '@ember/array/proxy';
import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import FastbootService from 'ember-cli-fastboot/services/fastboot';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';
import DS from 'ember-data';

import { WIDGET } from 'pep/constants/sidebar';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import { BasePageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import Document from 'pep/pods/document/model';
import Router from 'pep/router';
import ConfigurationService from 'pep/services/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface PageSidebarWidgetsMostCitedArgs extends BasePageSidebarWidgetArgs {}

export default class PageSidebarWidgetsMostCited extends Component<
    BaseGlimmerSignature<PageSidebarWidgetsMostCitedArgs>
> {
    @service store!: DS.Store;
    @service router!: Router;
    @service fastboot!: FastbootService;
    @service configuration!: ConfigurationService;

    @tracked isLoading = false;
    @tracked results: Document[] = [];

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.MOST_CITED;
    /**
     * Load the widget results data
     */
    @restartableTask
    *loadResults(): Generator<
        DS.AdapterPopulatedRecordArray<Document> & DS.PromiseArray<Document, ArrayProxy<Document>>,
        void,
        DS.AdapterPopulatedRecordArray<Document>
    > {
        const results = yield this.store.query('document', {
            queryType: 'MostCited',
            period: 'all',
            limit: this.configuration.base.global.cards.mostCited.limit
        });
        this.results = results.toArray();
    }

    /**
     * Load the widget results on render
     */
    @action
    @dontRunInFastboot
    onElementInsert() {
        later(() => {
            taskFor(this.loadResults).perform();
        }, 2000);
    }

    /**
     * Transition to the table on click. Stop anything else from happening so we dont close/open the
     * widget
     *
     * @memberof PageSidebarWidgetsMostCited
     */
    @action
    viewTable() {
        this.router.transitionTo('most-cited');
    }
}
