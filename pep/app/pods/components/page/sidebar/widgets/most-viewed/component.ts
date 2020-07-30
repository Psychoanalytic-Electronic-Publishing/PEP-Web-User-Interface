import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import AjaxService from 'pep/services/ajax';
import { serializeQueryParams } from 'pep/utils/serialize-query-params';

interface PageSidebarWidgetsMostViewedArgs {}

export default class PageSidebarWidgetsMostViewed extends Component<PageSidebarWidgetsMostViewedArgs> {
    @service ajax!: AjaxService;

    @tracked isOpen = true;
    @tracked isLoading = false;
    @tracked results = [];

    /**
     * Load the widget results data
     */
    async loadResults() {
        // TODO switch to ember-concurrency task (with TS-friendly decorators, etc)
        // to remove manual `isLoading` state management etc
        // @see https://jamescdavis.com/using-ember-concurrency-with-typescript/
        try {
            this.isLoading = true;
            const params = serializeQueryParams({ period: 'all', sourcecode: 'AOP', morethan: 3, limit: 3 });
            const response = await this.ajax.request(`Database/MostViewed/?${params}`);
            this.results = response?.documentList?.responseSet ?? [];
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
