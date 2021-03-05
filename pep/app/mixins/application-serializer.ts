import { isArray } from '@ember/array';

import DS from 'ember-data';

type Constructor<T = DS.RESTSerializer> = new (...args: any[]) => T;

/**
 * A mixin that adds app-wide serializer logic to ember-data models
 *
 * @export
 * @template TBase
 * @param {TBase} Base
 */
export default function ApplicationSerializer<TBase extends Constructor>(Base: TBase) {
    class ApplicationSerializerClass extends Base {
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
                snapshot.record.get('isNew') ||
                snapshot.changedAttributes()[key] ||
                (isArray(snapshot.record.alwaysSentAttributes) &&
                    snapshot.record.alwaysSentAttributes.indexOf(key) !== -1 &&
                    (!isArray(snapshot.record.unsendableAttributes) ||
                        snapshot.record.unsendableAttributes.indexOf(key) === -1))
            ) {
                super.serializeAttribute(snapshot, json, key, attribute);
            }
        }
    }

    return ApplicationSerializerClass;
}
