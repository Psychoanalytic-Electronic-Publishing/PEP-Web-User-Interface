import DocumentSerializer from 'pep/pods/document/serializer';
import DS from 'ember-data';

export default class SearchDocumentSerializer extends DocumentSerializer {
    /**
     * The API returns individual documents in the json as any array under documents.responseSet
     * @param {DS.Store} store
     * @param {DS.Model} primaryModelClass
     * @param {object} payload
     * @param {string} id
     * @param {string} requestType
     */
    normalizeSingleResponse(
        store: DS.Store,
        primaryModelClass: ModelWithName,
        payload: any,
        id: string | number,
        requestType: string
    ) {
        if (payload?.documents) {
            // single SearchDocument responses should never have kwicList ("hits in context")
            // since its a direct get-by-id fetch, so make sure empty lists are omitted
            // so they don't override the search result's contextual data that might already be cached
            payload.documents.responseSet = payload.documents.responseSet.map((item: any) => {
                if (item.kwicList?.length === 0) {
                    delete item.kwicList;
                }
                return item;
            });
        }

        return super.normalizeSingleResponse(store, primaryModelClass, payload, id, requestType);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        'search-document': SearchDocumentSerializer;
    }
}
