import attr from 'ember-data/attr';

import Document from 'pep/pods/document/model';

/**
 * SearchDocument is the same as Document, with the important distinction that
 * it has "search results context" aware fields populated, such as the matches/hits
 * (kwicList) which are NOT returned for direct single document fetches or non
 * fulltext searches, etc.
 *
 * We maintain these as separate models, so that this search context-aware data
 * is only overwritten at the approperiate times (i.e. a new search is performed).
 *
 * @export
 * @class SearchDocument
 * @extends {Document}
 */
export default class SearchDocument extends Document {
    // attributes
    @attr('string') kwic!: string;
    @attr() kwicList!: string[];
}

declare module 'ember-data/types/registries/model' {
    export default interface ModelRegistry {
        'search-document': SearchDocument;
    }
}
