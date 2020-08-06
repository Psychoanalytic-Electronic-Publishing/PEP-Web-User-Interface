import DS from 'ember-data';
import { camelize } from '@ember/string';
import { pluralize } from 'ember-inflector';
import ApplicationSerializerMixin from 'pep/mixins/application-serializer';

export default class ApplicationSerializer extends ApplicationSerializerMixin(DS.RESTSerializer) {
    /**
     * The API returns result sets in the JSON under modelName.responseSet
     * and the metadata under modelName.responseInfo
     * @param {DS.Store} store
     * @param {DS.Model} primaryModelClass
     * @param {object} payload
     * @param {string} id
     * @param {string} requestType
     */
    normalizeArrayResponse(
        store: DS.Store,
        primaryModelClass: DS.Model,
        payload: any,
        id: string | number,
        requestType: string
    ) {
        //@ts-ignore modelName does exist on the model class instance
        const modelKey = pluralize(camelize(primaryModelClass.modelName));
        payload.meta = payload?.[modelKey].responseInfo;
        payload[modelKey] = payload?.[modelKey].responseSet;
        return super.normalizeArrayResponse(store, primaryModelClass, payload, id, requestType);
    }
}

declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        application: ApplicationSerializer;
    }
}
