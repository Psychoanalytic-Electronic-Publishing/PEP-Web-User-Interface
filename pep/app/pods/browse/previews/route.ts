import Route from '@ember/routing/route';

import { buildSearchQueryParams } from 'pep/utils/search';

export default class BrowsePreviews extends Route {
    /**
     * Fetch the preview documents
     */
    model() {
        const queryParams = buildSearchQueryParams({
            smartSearchTerm: 'file_classification:preview',
            sort: 'authors asc'
        });

        return this.store.query('search-document', queryParams, {
            adapterOptions: {
                openUrl: true
            }
        });
    }

    afterModel(model: any) {
        for (const doc of model.toArray()) {
            console.log(doc);
        }
    }
}
