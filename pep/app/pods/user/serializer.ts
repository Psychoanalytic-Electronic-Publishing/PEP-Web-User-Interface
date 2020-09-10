import DS from 'ember-data';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';

import ApplicationSerializerMixin from 'pep/mixins/application-serializer';

export default class UserSerializer extends ApplicationSerializerMixin(DS.RESTSerializer) {
    primaryKey = 'UserId';

    /**
     * The PaDS API returns user list results in a root-level array
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
        payload = { [modelKey]: payload };
        return super.normalizeArrayResponse(store, primaryModelClass, payload, id, requestType);
    }

    /**
     * The PaDS API returns individual users directly in the root json object
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
        payload = { [modelKey]: payload };
        return super.normalizeSingleResponse(store, primaryModelClass, payload, id, requestType);
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        user: UserSerializer;
    }
}
