import { camelize } from '@ember/string';

import DS from 'ember-data';
import { pluralize } from 'ember-inflector';

import ApplicationSerializerMixin from 'pep/mixins/application-serializer';

export default class Volume extends ApplicationSerializerMixin(DS.RESTSerializer) {
    primaryKey = 'vol';

    /**
     * The API returns result sets in the JSON under sourceInfo.responseSet
     * and the metadata under sourceInfo.responseInfo
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
        if (payload?.volumeList) {
            payload.meta = payload.volumeList.responseInfo;
            payload[modelKey] = payload.volumeList.responseSet;
            delete payload.volumeList;
        }

        return super.normalizeArrayResponse(store, primaryModelClass, payload, id, requestType);
    }

    /**
     * The API returns individual documents in the json as any array under sourceInfo.responseSet
     * @param {DS.Store} store
     * @param {DS.Model} primaryModelClass
     * @param {object} payload
     * @param {string} id
     * @param {string} requestType
     */
    normalizeFindRecordResponse(
        store: DS.Store,
        primaryModelClass: ModelWithName,
        payload: any,
        id: string | number,
        requestType: string
    ) {
        const modelKey = camelize(primaryModelClass.modelName);
        if (payload?.volumeList) {
            payload.meta = payload.volumeList.responseInfo;
            payload[modelKey] = payload.volumeList.responseSet?.[0];
            delete payload.volumeList;
        }

        return super.normalizeFindRecordResponse(store, primaryModelClass, payload, id, requestType);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        volume: Volume;
    }
}
