import Document from 'pep/pods/document/serializer';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import { DS } from 'ember-data';

export default class GlossaryTerm extends Document {
    primaryKey = 'groupID';

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
        if (payload?.documents) {
            payload.meta = payload.documents.responseInfo;
            payload[modelKey] = payload.documents.responseSet;
            delete payload.documents;
        }

        return super.normalizeArrayResponse(store, primaryModelClass, payload, id, requestType);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        'glossary-term': GlossaryTerm;
    }
}
