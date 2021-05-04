import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';

import Book from 'pep/pods/book/model';
import { BrowseJournalParams } from 'pep/pods/browse/journal/route';
import BrowseJournalVolumeController from 'pep/pods/browse/journal/volume/controller';
import Journal from 'pep/pods/journal/model';
import SourceVolume from 'pep/pods/source-volume/model';

export interface BrowseJournalVolumeParams {
    volume_number: string;
}

export default class BrowseBookVolumesVolume extends Route {
    model(params: BrowseJournalVolumeParams) {
        const bookParams = this.paramsFor('browse.book.volumes') as BrowseJournalParams;

        return this.store.query('source-volume', {
            limit: 1000,
            sourceCode: bookParams.pep_code,
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
        const bookParams = this.paramsFor('browse.book.volumes') as BrowseJournalParams;
        const routeParams = this.paramsFor(this.routeName) as BrowseJournalVolumeParams;
        const book = this.modelFor('browse.journal.volumes') as Book;

        const volumes = await this.store.query('volume', { sourcecode: bookParams.pep_code });
        controller.book = book;
        controller.sourcecode = bookParams.pep_code;
        controller.meta = model.meta;
        controller.volumeInformation = volumes.findBy('id', routeParams.volume_number);
    }

    resetController(controller: BrowseJournalVolumeController, isExiting: boolean): void {
        if (isExiting) {
            controller.sourcecode = undefined;
            controller.book = undefined;
            controller.previewedResult = null;
        }
    }
}
