import DS from 'ember-data';
import { isNone } from '@ember/utils';

export default class JsonTransform extends DS.Transform {
    /**
     * A 'json' attr type is considered "empty" if its null/undefined
     * or is an object with no properties
     * @param {(object | null)} serialized
     * @param {DS.AttrOptions} options
     * @returns {object | null}
     */
    deserialize(serialized: object | null) {
        return isNone(serialized) || Object.keys(serialized).length === 0 ? null : serialized;
    }

    /**
     * Always send at least an empty object for 'json' attr types
     * @param {(object | null)} deserialized
     * @returns {object}
     */
    serialize(deserialized: object | null) {
        return isNone(deserialized) ? {} : deserialized;
    }
}

declare module 'ember-data/types/registries/transform' {
    export default interface TransformRegistry {
        json: JsonTransform;
    }
}
