import Route from '@ember/routing/route';

import Document from 'pep/pods/document/model';
import { getFreudGWVolumes } from 'pep/utils/browse';

export default class BrowseBookGw extends Route {
    model() {
        const model = this.modelFor('browse') as { gw: Document; se: Document };
        return getFreudGWVolumes(model.gw.document);
    }
}
