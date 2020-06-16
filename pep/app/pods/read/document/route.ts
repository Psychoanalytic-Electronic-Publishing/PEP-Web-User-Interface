import Route from '@ember/routing/route';
import { later } from '@ember/runloop';
import { Promise } from 'rsvp';
import { PageNav } from 'pep/mixins/page-layout';
import { FIXTURE_SEARCH_RESULTS } from 'pep/constants/fixtures';

export default class ReadDocument extends PageNav(Route) {
    navController = 'read/document';
    searchResults = null;

    model(params) {
        const id = params.document_id;
        return new Promise((resolve) => {
            later(() => resolve(FIXTURE_SEARCH_RESULTS.find((res) => `${res.id}` === id)), 600);
        });
    }

    afterModel(model, transition) {
        super.afterModel(model, transition);
        //TODO fetch the search results for the sidebar based on the passed query params
        this.searchResults = FIXTURE_SEARCH_RESULTS;
    }

    setupController(controller, model) {
        super.setupController(controller, model);
        controller.searchResults = this.searchResults;
        controller.metadata = { total: this.searchResults?.length };
    }
}
