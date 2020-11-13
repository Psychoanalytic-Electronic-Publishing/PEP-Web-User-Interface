import Route from '@ember/routing/route';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import BrowseJournalController from 'pep/pods/browse/journal/controller';
import Source from 'pep/pods/source/model';

export default class BrowseJournal extends Route {
    sourceCode?: string;
    model(params: { pep_code: string }) {
        this.sourceCode = params.pep_code;
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('browse.journal'),
            pagingRootKey: null,
            filterRootKey: null
        });

        return this.store.query('source', { ...apiQueryParams, sourceCode: params.pep_code });
    }

    setupController(controller: BrowseJournalController, model: RecordArrayWithMeta<Source>) {
        super.setupController(controller, model);
        controller.sourceCode = this.sourceCode;
        controller.paginator = usePagination<Source>({
            context: controller,
            modelName: 'source',
            filterList: ['sourceCode'],
            models: model.toArray() ?? [],
            metadata: model.meta,
            pagingRootKey: null,
            filterRootKey: null
        });
    }
}
