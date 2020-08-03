import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import DS from 'ember-data';
import { dontRunInFastboot } from 'pep/decorators/fastboot';
import Document from 'pep/pods/document/model';

interface PageSidebarWidgetsMostCitedArgs {}

export default class PageSidebarWidgetsMostCited extends Component<PageSidebarWidgetsMostCitedArgs> {
    @service store!: DS.Store;

    @tracked isOpen = true;
    @tracked isLoading = false;
    @tracked results: Document[] = [];

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
                sourcecode: 'AOP',
                morethan: 10,
                limit: 3
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
}
