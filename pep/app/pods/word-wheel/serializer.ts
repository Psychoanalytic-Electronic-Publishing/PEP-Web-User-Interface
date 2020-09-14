import DS from 'ember-data';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';

import ApplicationSerializerMixin from 'pep/mixins/application-serializer';

export default class WordWheelSerializer extends ApplicationSerializerMixin(DS.RESTSerializer) {
    /**
     * The API returns result sets in the JSON under termIndex.responseSet
     * and the metadata under documentList.responseInfo.
     *
     * The model objects dont have unique IDs, so we create composite UID keys
     * from the `field` and `term` attribute values
     *
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
        if (payload?.termIndex) {
            payload.meta = payload.termIndex.responseInfo;
            payload[modelKey] = payload.termIndex.responseSet;
            delete payload.termIndex;
            if (payload[modelKey]?.length > 0) {
                payload[modelKey] = payload[modelKey].map((o: any) => ({ ...o, id: `${o.field}-${o.term}` }));
            }
        }

        return super.normalizeArrayResponse(store, primaryModelClass, payload, id, requestType);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        wordWheel: WordWheelSerializer;
    }
}
