import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';

import { BrowseJournalParams } from 'pep/pods/browse/journal/route';
import BrowseJournalVolumeController from 'pep/pods/browse/journal/volume/controller';
import Journal from 'pep/pods/journal/model';
import SourceVolume from 'pep/pods/source-volume/model';

export interface BrowseJournalVolumeParams {
    volume_number: string;
}
export default class BrowseJournalVolume extends Route {
    model(params: BrowseJournalVolumeParams) {
        const journalParams = this.paramsFor('browse.journal') as BrowseJournalParams;

        return this.store.query('source-volume', {
            limit: 1000,
            sourceCode: journalParams.pep_code,
            volume: params.volume_number,
            moreinfo: 2
        });
    }

    async setupController(
        controller: BrowseJournalVolumeController,
        model: RecordArrayWithMeta<SourceVolume[]>,
        transition: Transition
    ): Promise<void> {
        super.setupController(controller, model, transition);
        const journalParams = this.paramsFor('browse.journal') as BrowseJournalParams;
        const routeParams = this.paramsFor(this.routeName) as BrowseJournalVolumeParams;
        const journal = this.modelFor('browse.journal') as Journal;

        const volumes = await this.store.query('volume', { sourcecode: journalParams.pep_code });
        controller.journal = journal;
        controller.sourcecode = journalParams.pep_code;
        controller.meta = model.meta;
        controller.volumeInformation = volumes.findBy('id', routeParams.volume_number);
    }

    resetController(controller: BrowseJournalVolumeController, isExiting: boolean): void {
        if (isExiting) {
            controller.sourcecode = undefined;
            controller.journal = undefined;
            controller.previewedResult = null;
        }
    }
}
