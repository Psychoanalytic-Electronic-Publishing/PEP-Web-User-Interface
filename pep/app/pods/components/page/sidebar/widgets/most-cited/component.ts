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
    @dontRunInFastboot
    async loadResults() {
        // TODO switch to ember-concurrency task (with TS-friendly decorators, etc)
        // to remove manual `isLoading` state management etc
        // @see https://jamescdavis.com/using-ember-concurrency-with-typescript/
        try {
            this.isLoading = true;
            const results = await this.store.query('document', {
                queryType: 'MostCited',
                period: 'all',
                morethan: 10,
                limit: 10
            });
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
