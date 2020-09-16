import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import DS from 'ember-data';

import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';
import Router from 'pep/router';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import { restartableTask } from 'ember-concurrency-decorators';
import { taskFor } from 'ember-concurrency-ts';

interface PageSidebarWidgetsMostCitedArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsMostCited extends Component<PageSidebarWidgetsMostCitedArgs> {
    @service store!: DS.Store;
    @service router!: Router;
    @service fastboot!: FastbootService;
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
    *loadResults() {
        const results = yield this.store.query('document', {
            queryType: 'MostCited',
            period: 'all',
            morethan: 10,
            limit: 10
        });
        this.results = results.toArray();
    }

    /**
     * Load the widget results on render
     */
    @action
    @dontRunInFastboot
    onElementInsert() {
        taskFor(this.loadResults).perform();
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
