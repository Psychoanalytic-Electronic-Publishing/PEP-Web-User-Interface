import Route from '@ember/routing/route';

export default class BrowseJournalVolume extends Route {
    model(params: { volume_number: string }) {
        const journalParams = this.paramsFor('browse.journal') as { pep_code: string };

        return this.store.query('source-volume', {
            limit: 1000,
            sourceCode: journalParams.pep_code,
            volume: params.volume_number
        });
    }
}