import Route from '@ember/routing/route';
import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import Document from 'pep/pods/document/model';
import MostViewedController from 'pep/pods/most-viewed/controller';
import { PageNav } from 'pep/mixins/page-layout';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';
import { useQueryParams } from 'pep/hooks/useQueryParams';

export default class MostViewed extends PageNav(Route) {
    navController = 'most-viewed';
    /**
     * Load the widget results data
     */
    async model(queryParams: any[]) {
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('most-viewed'),
            pagingRootKey: null,
            filterRootKey: null,
            filterList: ['author', 'title', 'sourcename', 'period', 'queryType'],
            processQueryParams: (params) => ({ ...params, ...queryParams })
        });
        return this.store.query('document', apiQueryParams);
    }

    /**
     * Set up pagination on the controller
     * @param {MostViewedController} controller
     * @param {object} model
     */
    setupController(controller: MostViewedController, model: RecordArrayWithMeta<Document>) {
        super.setupController(controller, model);
        controller.paginator = usePagination<Document>({
            context: controller,
            modelName: 'document',
            models: model?.toArray() ?? [],
            metadata: model?.meta,
            filterList: ['author', 'title', 'sourcename', 'period', 'queryType'],
            pagingRootKey: null,
            filterRootKey: null
        });
        controller.searchQueryParams = useQueryParams({
            context: controller,
            params: ['author', 'title', 'journal', 'period']
        });
    }
}
