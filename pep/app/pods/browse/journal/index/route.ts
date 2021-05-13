import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import usePagination, { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';
import { buildQueryParams } from '@gavant/ember-pagination/utils/query-params';

import { WIDGET } from 'pep/constants/sidebar';
import BrowseJournalIndexController from 'pep/pods/browse/journal/index/controller';
import { BrowseJournalParams } from 'pep/pods/browse/journal/route';
import Journal from 'pep/pods/journal/model';
import Source from 'pep/pods/source/model';
import SidebarService from 'pep/services/sidebar';

export default class BrowseJournalIndex extends Route {
    @service sidebar!: SidebarService;
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
        const journalParams = this.paramsFor('browse.journal') as BrowseJournalParams;
        this.sourceCode = journalParams.pep_code;
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
        controller: BrowseJournalIndexController,
        model: RecordArrayWithMeta<Source>,
        transition: Transition
    ) {
        super.setupController(controller, model, transition);

        controller.sourcecode = this.sourceCode;
        controller.journal = this.modelFor('browse.journal') as Journal;
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

        this.sidebar.update({
            [WIDGET.PUBLISHER_INFO]: this.sourceCode
        });
    }
}
