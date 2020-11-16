import Route from '@ember/routing/route';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import BrowseJournalIndexController from 'pep/pods/browse/journal/index/controller';
import Journal from 'pep/pods/journal/model';
import Source from 'pep/pods/source/model';

export default class BrowseJournalIndex extends Route {
    sourceCode?: string;
    journalInformation?: Journal;
    model() {
        const journalParams = this.paramsFor('browse.journal') as { pep_code: string };
        this.sourceCode = journalParams.pep_code;
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('browse.journal.index'),
            pagingRootKey: null,
            filterRootKey: null
        });

        return this.store.query('volume', { ...apiQueryParams, sourcecode: journalParams.pep_code });
    }

    async afterModel() {
        const journal = await this.store.query('journal', { sourcecode: this.sourceCode });
        this.journalInformation = journal.firstObject;
    }

    setupController(controller: BrowseJournalIndexController, model: RecordArrayWithMeta<Source>) {
        super.setupController(controller, model);
        controller.sourcecode = this.sourceCode;
        controller.journal = this.journalInformation;
        controller.paginator = usePagination<Source>({
            context: controller,
            modelName: 'volume',
            filterList: ['sourcecode'],
            models: model.toArray() ?? [],
            metadata: model.meta,
            pagingRootKey: null,
            filterRootKey: null
        });
    }
}
