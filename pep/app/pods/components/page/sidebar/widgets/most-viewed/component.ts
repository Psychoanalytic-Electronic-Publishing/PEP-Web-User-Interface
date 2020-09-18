import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import Router from 'pep/router';
import { PageSidebarWidgetArgs } from 'pep/pods/components/page/sidebar/widgets/component';
import { WIDGET } from 'pep/constants/sidebar';
import { taskFor } from 'ember-concurrency-ts';
import { restartableTask } from 'ember-concurrency-decorators';
import ConfigurationService from 'pep/services/configuration';

interface PageSidebarWidgetsMostViewedArgs extends PageSidebarWidgetArgs {}

export default class PageSidebarWidgetsMostViewed extends Component<PageSidebarWidgetsMostViewedArgs> {
    @service store!: DS.Store;
    @service router!: Router;
    @service fastboot!: FastbootService;
    @service configuration!: ConfigurationService;

    @tracked isLoading = false;
    @tracked results: Document[] = [];

    get isOpen() {
        return this.args.openWidgets.includes(this.widget);
    }

    widget = WIDGET.MOST_VIEWED;

    /**
     * Load the widget results data
     */
    @restartableTask
    *loadResults() {
        const results = yield this.store.query('document', {
            queryType: 'MostViewed',
            viewperiod: 2,
            limit: this.configuration.base.global.cards.mostViewed.limit
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
     * @memberof PageSidebarWidgetsMostViewed
     */
    @action
    viewTable() {
        this.router.transitionTo('most-viewed');
    }
}
