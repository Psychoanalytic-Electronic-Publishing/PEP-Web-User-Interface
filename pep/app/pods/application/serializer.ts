import DS from 'ember-data';
import { isArray } from '@ember/array';

// [PRO-TIP!] Do you need to save models along with changes to their relationships?
//
// JSON-API does not support this (currently) out-of-the-box, however, we may
// be able to use the `ember-data-save-relationships` addon to accomplish that.
// Alternatively, we can just follow a simpler (but less efficient/more brittle)
// solution of performing multiple consecutive API requests.
//
// @see https://github.com/psteininger/ember-data-save-relationships
// @see https://emberigniter.com/saving-models-relationships-json-api/

export default class ApplicationSerializer extends DS.JSONAPISerializer {
    /**
     * Do not serialize attributes if the record is being updated and the attribute
     * value was not modified. Also never serialize attributes that have been
     * annotated with the `@unsendable` decorator.
     *
     * @param snapshot {DS.Snapshot<string | number>}
     * @param json {Object}
     * @param key {String}
     * @param attribute {Object}
     * @see https://github.com/emberjs/data/issues/3467#issuecomment-543176123
     */
    serializeAttribute(snapshot: DS.Snapshot<string | number>, json: {}, key: string, attribute: {}) {
        if (
            (snapshot.record.get('isNew') || snapshot.changedAttributes()[key]) &&
            (!isArray(snapshot.record.unsendableAttributes) || snapshot.record.unsendableAttributes.indexOf(key) === -1)
        ) {
            super.serializeAttribute(snapshot, json, key, attribute);
        }
    }
}

declare module 'ember-data/types/registries/serializer' {
    export default interface SerializerRegistry {
        application: ApplicationSerializer;
    }
}
