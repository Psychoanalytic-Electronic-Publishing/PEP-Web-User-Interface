import Route from '@ember/routing/route';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams, removeEmptyQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { PageNav } from 'pep/mixins/page-layout';
import BrowseController from 'pep/pods/browse/controller';
import Journal from 'pep/pods/journal/model';

export default class Browse extends PageNav(Route) {
    navController = 'browse';

    async setupController(controller: BrowseController, model: RecordArrayWithMeta<Journal>) {
        super.setupController(controller, model);
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('browse'),
            pagingRootKey: null,
            filterRootKey: null
        });
        const journals = await this.store.query('journal', removeEmptyQueryParams(apiQueryParams));
        controller.journals = usePagination<Journal>({
            context: controller,
            modelName: 'journal',
            models: journals.toArray(),
            metadata: journals?.meta,
            pagingRootKey: null,
            filterRootKey: null
        });
    }
}
