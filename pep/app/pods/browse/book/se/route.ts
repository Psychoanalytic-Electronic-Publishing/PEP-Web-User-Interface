import Controller from '@ember/controller';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import { FREUD_SE_CODE } from 'pep/constants/books';
import { BrowseModel } from 'pep/pods/browse/route';
import { getFreudSEVolumes } from 'pep/utils/browse';

export default class BrowseBookSe extends Route {
    model() {
        const model = this.modelFor('browse') as BrowseModel;
        return getFreudSEVolumes(model.se.document);
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
