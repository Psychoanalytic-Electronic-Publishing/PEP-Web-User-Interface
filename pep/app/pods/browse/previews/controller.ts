import Controller from '@ember/controller';
import { DOCUMENT_IMG_BASE_URL } from 'pep/constants/documents';

export default class BrowsePreviews extends Controller {
    get imageUrl(): string {
        return DOCUMENT_IMG_BASE_URL;
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'browse-previews': BrowsePreviews;
    }
}
