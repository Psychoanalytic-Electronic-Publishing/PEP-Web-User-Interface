import { inject as service } from '@ember/service';
import { camelize, classify } from '@ember/string';

import DS from 'ember-data';
import { pluralize } from 'ember-inflector';

import ApplicationSerializerMixin from 'pep/mixins/application-serializer';
import PepSessionService from 'pep/services/session';

export default class UserSerializer extends ApplicationSerializerMixin(DS.RESTSerializer) {
    @service session!: PepSessionService;

    primaryKey = 'UserId';

    /**
     * The PaDS API returns attributes in PascalCase
     * @param {string} attr
     * @returns {string}
     */
    keyForAttribute(attr: string) {
        return classify(attr);
    }

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

    /**
     * User payloads must be sent in the root JSON object
     * and must include the currently logged in user's SessionId
     * @param {object} hash
     * @param {ModelWithName} typeClass
     * @param {DS.Snapshot<K>} snapshot
     * @param {object} options
     */
    serializeIntoHash<K extends string | number>(
        hash: any,
        typeClass: ModelWithName,
        snapshot: DS.Snapshot<K>,
        options: object
    ) {
        super.serializeIntoHash(hash, typeClass, snapshot, options);
        const root = this.payloadKeyFromModelName(typeClass.modelName);
        Object.keys(hash[root]).forEach((key) => (hash[key] = hash[root][key]));
        delete hash[root];

        if (this.session.isAuthenticated) {
            hash.SessionId = this.session.data.authenticated.SessionId ?? '';
        }
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your serializers.
declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        user: UserSerializer;
    }
}
