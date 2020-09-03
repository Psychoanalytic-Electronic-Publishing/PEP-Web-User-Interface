import DS from 'ember-data';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import ApplicationSerializer from 'pep/pods/application/serializer';

export default class SimilarityMatch extends ApplicationSerializer {
    normalize() {
        console.log('in normalize');
        return super.normalize(...arguments);
    }

    normalizeResponse(
        store: DS.Store,
        primaryModelClass: ModelWithName,
        payload: any,
        id: string | number,
        requestType: string
    ) {
        if (payload?.documentList) {
        }
        return super.normalizeResponse(store, primaryModelClass, payload, id, requestType);
    }
    /**
     * The API returns result sets in the JSON under documentList.responseSet
     * and the metadata under documentList.responseInfo
     * @param {DS.Store} store
     * @param {DS.Model} primaryModelClass
     * @param {object} payload
     * @param {string} id
     * @param {string} requestType
     */
    normalizeArrayResponse(
        store: DS.Store,
        primaryModelClass: ModelWithName,
        payload: any,
        id: string | number,
        requestType: string
    ) {
        const modelKey = pluralize(camelize(primaryModelClass.modelName));
        if (payload?.documentList) {
            payload.documentList.responseSet = payload.documentList.responseSet.map((item: any) => {
                const document = item;
                const similarDocumentItems = new Map(Object.entries(document.similarityMatch.similarDocs));
                const similarDocuments = similarDocumentItems.get(document.documentId) as [];

                return {
                    ...document,
                    similarDocuments
                };
            });
            payload.meta = payload.documentList.responseInfo;
            payload[modelKey] = payload.documentList.responseSet;
            delete payload.documentList;
        }

        return super.normalizeArrayResponse(store, primaryModelClass, payload, id, requestType);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        'similarity-match': SimilarityMatch;
    }
}
