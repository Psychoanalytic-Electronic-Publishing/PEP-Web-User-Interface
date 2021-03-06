import { camelize } from '@ember/string';

import { DS } from 'ember-data';
import { pluralize } from 'ember-inflector';

import ApplicationSerializer from 'pep/pods/application/serializer';
import ConfigurationModel from 'pep/pods/configuration/model';

export default class Configuration extends ApplicationSerializer {
    primaryKey = 'configName';

    payloadKeyFromModelName() {
        return 'configList';
    }

    serialize(snapshot: DS.Snapshot<string | number>, options: object & { includeId: boolean }): object {
        options.includeId = true;
        const serialized = super.serialize(snapshot, options) as ConfigurationModel;
        return [serialized];
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
        if (payload?.configList) {
            payload[modelKey] = payload.configList;
            delete payload.configList;
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
        if (payload?.configList) {
            payload[modelKey] = payload.configList[0];

            delete payload.configList;
        }

        return super.normalizeSingleResponse(store, primaryModelClass, payload, id, requestType);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        configuration: Configuration;
    }
}
