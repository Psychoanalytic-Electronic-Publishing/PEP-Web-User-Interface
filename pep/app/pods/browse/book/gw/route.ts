import Controller from '@ember/controller';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import { FREUD_GW_CODE, GW_VOLUME_DOCUMENT_ID } from 'pep/constants/books';
import BrowseController, { BrowseTabs } from 'pep/pods/browse/controller';
import { BrowseModel } from 'pep/pods/browse/route';
import { getFreudGWVolumes } from 'pep/utils/browse';

export default class BrowseBookGw extends Route {
    async model() {
        const model = await this.store.findRecord('document', GW_VOLUME_DOCUMENT_ID);
        return getFreudGWVolumes(model.document);
    }

    setupController(controller: Controller & { imageUrl: string }, model: BrowseModel, transition: Transition) {
        super.setupController(controller, model, transition);
        const browseModel = this.modelFor('browse') as BrowseModel;
        if (browseModel) {
            controller.imageUrl = browseModel.books?.find((item) => item.bookCode === FREUD_GW_CODE)?.bannerURL ?? '';
        }
        const browseController = this.controllerFor('browse') as BrowseController;
        browseController.tab = BrowseTabs.BOOKS;
    }
}
