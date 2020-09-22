import DS from 'ember-data';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import DocumentModel from 'pep/pods/document/model';

import ApplicationSerializerMixin from 'pep/mixins/application-serializer';

/**
 * Build correctly formatted similarity match items based on what the API sends
 *
 * @param {*} item
 * @returns
 */
const transformDocument = (item: any) => {
    const document = item;
    const similarDocumentItems = new Map(Object.entries(document?.similarityMatch?.similarDocs ?? {}));
    const similarDocuments = (similarDocumentItems.get(document.documentID) as []) ?? [];

    const documentToReturn = { ...document } as DocumentModel;
    if (documentToReturn.kwicList.length === 0) {
        delete documentToReturn.kwicList;
    }
    if (documentToReturn)
        if (similarDocuments.length) {
            documentToReturn.similarityMatch = {
                id: document.documentID,
                // @ts-ignore Because we are building a model here - type does exist
                type: 'similarity-match',
                similarMaxScore: document?.similarityMatch?.similarMaxScore,
                similarNumFound: document?.similarityMatch?.similarNumFound,
                similarDocuments
            };
        } else {
            documentToReturn.similarityMatch = null;
        }

    return documentToReturn;
};

export default class Document extends ApplicationSerializerMixin(DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin)) {
    primaryKey = 'documentID';

    attrs = {
        similarityMatch: { embedded: 'always' }
    };

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
            payload.documentList.responseSet = payload.documentList.responseSet.map((item: any) =>
                transformDocument(item)
            );

            payload.meta = payload.documentList.responseInfo;
            payload[modelKey] = payload.documentList.responseSet;
            delete payload.documentList;
        }

        return super.normalizeArrayResponse(store, primaryModelClass, payload, id, requestType);
    }

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
        const modelKey = camelize(primaryModelClass.modelName);
        if (payload?.documents) {
            payload.documents.responseSet = payload.documents.responseSet.map((item: any) => transformDocument(item));

            payload[modelKey] = payload.documents.responseSet?.[0];
            payload[modelKey].meta = payload.documents.responseInfo;
            delete payload.documents;
        }

        return super.normalizeSingleResponse(store, primaryModelClass, payload, id, requestType);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        document: Document;
    }
}
