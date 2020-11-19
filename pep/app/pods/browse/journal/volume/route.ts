import Route from '@ember/routing/route';

import { BrowseJournalParams } from 'pep/pods/browse/journal/route';

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
}
