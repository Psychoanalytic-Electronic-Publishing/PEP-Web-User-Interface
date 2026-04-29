import Controller from '@ember/controller';
import Transition from '@ember/routing/-private/transition';
import Route from '@ember/routing/route';

import { BOOK_COLLECTIONS_BY_ROUTE_SEGMENT } from 'pep/constants/books';
import BrowseController, { BrowseTabs } from 'pep/pods/browse/controller';
import { BrowseModel } from 'pep/pods/browse/route';
import { getCollectionVolumes } from 'pep/utils/browse';

const collection = BOOK_COLLECTIONS_BY_ROUTE_SEGMENT.cwb;

export default class BrowseBookCwb extends Route {
    async model() {
        const model = await this.store.findRecord('document', collection.volumeDocumentId);
        return getCollectionVolumes(model.document, collection.trimLeadingRows);
    }

    setupController(controller: Controller & { imageUrl: string; altTranslationKey: string; volumeHeadingTranslationKey: string }, model: BrowseModel, transition: Transition) {
        super.setupController(controller, model, transition);
        const browseModel = this.modelFor('browse') as BrowseModel;
        if (browseModel) {
            controller.imageUrl = browseModel.books?.find((item) => item.bookCode === collection.bookCode)?.bannerURL ?? '';
        }
        controller.altTranslationKey = collection.altTranslationKey;
        controller.volumeHeadingTranslationKey = collection.volumeHeadingTranslationKey;
        const browseController = this.controllerFor('browse') as BrowseController;
        browseController.tab = BrowseTabs.BOOKS;
    }
}
