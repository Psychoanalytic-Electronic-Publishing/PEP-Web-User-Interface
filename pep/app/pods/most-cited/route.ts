import Route from '@ember/routing/route';
import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import Document from 'pep/pods/document/model';
import MostCitedController from 'pep/pods/most-cited/controller';
import { PageNav } from 'pep/mixins/page-layout';
import { buildQueryParams, removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';
import { useQueryParams } from 'pep/hooks/useQueryParams';
import { SearchParams } from 'pep/pods/search/route';

export default class MostCited extends PageNav(Route) {
    navController = 'most-cited';

    /**
     * Load the table data
     *
     * @returns {Promise<Document[]>}
     * @memberof MostCited
     */
    async model(queryParams: SearchParams) {
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('most-cited'),
            pagingRootKey: null,
            filterRootKey: null,
            filterList: ['author', 'title', 'sourcename', 'period', 'queryType'],
            processQueryParams: (params) => ({ ...params, ...queryParams })
        });
        return this.store.query('document', removeEmptyQueryParams(apiQueryParams));
    }

    /**
     * Set up the pagination on the controller
     * @param {MostCitedController} controller
     * @param {object} model
     */
    setupController(controller: MostCitedController, model: RecordArrayWithMeta<Document>) {
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
