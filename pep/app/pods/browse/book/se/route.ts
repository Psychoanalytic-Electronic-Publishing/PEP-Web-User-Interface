import Controller from '@ember/controller';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import { FREUD_SE_CODE, SE_VOLUME_DOCUMENT_ID } from 'pep/constants/books';
import { BrowseModel } from 'pep/pods/browse/route';
import { getFreudSEVolumes } from 'pep/utils/browse';

export default class BrowseBookSe extends Route {
    async model() {
        const model = await this.store.findRecord('document', SE_VOLUME_DOCUMENT_ID);
        return getFreudSEVolumes(model.document);
    }
    setupController(controller: Controller & { imageUrl: string }, model: BrowseModel, transition: Transition) {
        super.setupController(controller, model, transition);
        const browseController = this.modelFor('browse') as BrowseModel;
        if (browseController) {
            controller.imageUrl =
                browseController.books?.find((item) => item.bookCode === FREUD_SE_CODE)?.bannerURL ?? '';
        }
    }
}
