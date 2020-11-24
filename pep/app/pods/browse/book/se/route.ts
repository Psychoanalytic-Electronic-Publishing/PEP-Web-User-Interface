import Route from '@ember/routing/route';

import Document from 'pep/pods/document/model';
import { getFreudSEVolumes } from 'pep/utils/browse';

export default class BrowseBookSe extends Route {
    model() {
        const model = this.modelFor('browse') as { gw: Document; se: Document };
        return getFreudSEVolumes(model.se.document);
    }
}
