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

    //TODO use ember-concurrency task
    async loadResults() {
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

    @action
    onElementInsert() {
        this.loadResults();
    }
}
