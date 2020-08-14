import Route from '@ember/routing/route';

export default class MostCited extends Route {
    /**
     * Load the widget results data
     */
    async model() {
        // TODO switch to ember-concurrency task (with TS-friendly decorators, etc)
        // to remove manual `isLoading` state management etc
        // @see https://jamescdavis.com/using-ember-concurrency-with-typescript/
        try {
            const results = await this.store.query('document', {
                queryType: 'MostCited',
                period: 'all',
                sourcecode: 'AOP',
                limit: 10
            });
            return results.toArray();
        } catch (err) {
            return [];
        }
    }
}
