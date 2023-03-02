import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

import { RecordArrayWithMeta } from '@gavant/ember-pagination/hooks/pagination';

import { WIDGET } from 'pep/constants/sidebar';
import { BrowseJournalParams } from 'pep/pods/browse/journal/route';
import BrowseJournalVolumeController from 'pep/pods/browse/journal/volume/controller';
import Journal from 'pep/pods/journal/model';
import SourceVolume from 'pep/pods/source-volume/model';
import SidebarService from 'pep/services/sidebar';

export interface BrowseJournalVolumeParams {
    volume_number: string;
}
export default class BrowseJournalVolume extends Route {
    @service sidebar!: SidebarService;

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

        const volumeId = routeParams.volume_number.replace(/[^0-9]/, '');
        controller.volumeInformation = volumes.findBy('id', volumeId);

        console.log('controller.volumeInformation', controller.volumeInformation);

        this.sidebar.update({
            [WIDGET.PUBLISHER_INFO]: journalParams.pep_code
        });
    }

    resetController(controller: BrowseJournalVolumeController, isExiting: boolean, transition: Transition): void {
        super.resetController(controller, isExiting, transition);
        if (isExiting) {
            controller.sourcecode = undefined;
            controller.journal = undefined;
            controller.previewedResult = null;
        }
    }
}
