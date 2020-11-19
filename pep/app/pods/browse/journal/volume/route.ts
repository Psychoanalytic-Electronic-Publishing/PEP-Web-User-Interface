import Route from '@ember/routing/route';

import { BrowseJournalParams } from 'pep/pods/browse/journal/route';
import BrowseJournalVolumeController from 'pep/pods/browse/journal/volume/controller';
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
            volume: params.volume_number
        });
    }

    async setupController(controller: BrowseJournalVolumeController, model: SourceVolume[]) {
        super.setupController(controller, model);
        const journalParams = this.paramsFor('browse.journal') as BrowseJournalParams;
        const routeParams = this.paramsFor(this.routeName) as BrowseJournalVolumeParams;

        const volumes = await this.store.query('volume', { sourcecode: journalParams.pep_code });

        controller.volumeInformation = volumes.findBy('id', routeParams.volume_number);
    }
}
