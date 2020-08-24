import Route from '@ember/routing/route';
import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import Document from 'pep/pods/document/model';
import MostCitedController from 'pep/pods/most-cited/controller';
import { PageNav } from 'pep/mixins/page-layout';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';
export default class MostCited extends PageNav(Route) {
    navController = 'most-cited';
    /**
     * Load the widget results data
     */
    async model() {
        const queryParams = buildQueryParams({
            context: this.controllerFor('most-cited'),
            pagingRootKey: null,
            filterRootKey: null,
            filterList: ['author', 'title', 'sourcename', 'period', 'queryType']
        });
        return this.store.query('document', queryParams);
    }

    /**
     * Set the search results data on the controller
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
    }
}
