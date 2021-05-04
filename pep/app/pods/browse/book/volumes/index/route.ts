import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import Book from 'pep/pods/book/model';
import BrowseBookVolumesIndexController from 'pep/pods/browse/book/volumes/index/controller';
import { BrowseJournalParams } from 'pep/pods/browse/journal/route';
import Source from 'pep/pods/source/model';

export default class BrowseBookVolumesIndex extends Route {
    sourceCode?: string;
    // API removed paging - but Im leaving it in for now in case we change our minds
    limit = 1000;
    /**
     * Loads the volumes for a specific source
     *
     * @return {Volume[]}
     * @memberof BrowseJournalIndex
     */
    model() {
        const params = this.paramsFor('browse.book.volumes') as BrowseJournalParams;
        this.sourceCode = params.pep_code;
        const apiQueryParams = buildQueryParams({
            context: this.controllerFor('browse.journal.index'),
            pagingRootKey: null,
            filterRootKey: null,
            limit: this.limit
        });

        return this.store.query('volume', { ...apiQueryParams, sourcecode: this.sourceCode });
    }

    /**
     * Set up Paging
     *
     * @param {BrowseJournalIndexController} controller
     * @param {RecordArrayWithMeta<Source>} model
     * @memberof BrowseJournalIndex
     */
    setupController(
        controller: BrowseBookVolumesIndexController,
        model: RecordArrayWithMeta<Source>,
        transition: Transition
    ) {
        super.setupController(controller, model, transition);

        controller.sourcecode = this.sourceCode;
        controller.book = this.modelFor('browse.book.volumes') as Book;
        controller.paginator = usePagination<Source>({
            context: controller,
            modelName: 'volume',
            filterList: ['sourcecode'],
            models: model.toArray() ?? [],
            metadata: model.meta,
            pagingRootKey: null,
            filterRootKey: null,
            limit: this.limit
        });
    }
}
