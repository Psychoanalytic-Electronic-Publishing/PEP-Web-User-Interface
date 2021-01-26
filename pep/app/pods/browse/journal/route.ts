import Route from '@ember/routing/route';

export interface BrowseJournalParams {
    pep_code: string;
}

export default class BrowseJournal extends Route {
    async model(params: BrowseJournalParams) {
        const journal = await this.store.query('journal', { sourcecode: params.pep_code });
        return journal.firstObject;
    }
}
