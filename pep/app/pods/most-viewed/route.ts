import Route from '@ember/routing/route';
import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import Document from 'pep/pods/document/model';
import MostCitedController from 'pep/pods/most-cited/controller';
import { PageNav } from 'pep/mixins/page-layout';

export default class MostViewed extends PageNav(Route) {
    navController = 'most-cited';
    /**
     * Load the widget results data
     */
    async model() {
        return this.store.query('document', {
            queryType: 'MostCited',
            period: 'all',
            limit: 40
        });
    }

    /**
     * Set the search results data on the controller
     * @param {ReadDocumentController} controller
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
