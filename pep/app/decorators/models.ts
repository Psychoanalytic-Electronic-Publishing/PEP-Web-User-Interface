import { isArray } from '@ember/array';

/**
 * Annotates a DS.Model attribute as unsendable, meaning it will never be serialized
 * in the JSON payload for API requests (e.g. POST, PATCH). This is required for some
 * model attributes which the API does not allow the client to modify, only read.
 *
 * NOTE: The proper modifications need to be made to the application/serializer's
 * `serializeAttribute()` method to support this decorator.
 *
 * Usage:
 * ```
 * class MyModel extends Model {
 *     \@unsendable \@attr('date') dateCreated!: Date;
 * }
 * ```
 */
export function unsendable(target: any, propertyKey: string) {
    if (!isArray(target.unsendableAttributes)) {
        target.unsendableAttributes = [];
    }

    if (target.unsendableAttributes.indexOf(propertyKey) === -1) {
        target.unsendableAttributes.push(propertyKey);
    }
}

/**
 * Annotates a DS.Model attribute as always sent, meaning it will ALWAYS be serialized
 * in the JSON payload for API requests (e.g. POST, PATCH), regardless of whether or
 * not it what was changed.
 *
 * NOTE: The proper modifications need to be made to the application/serializer's
 * `serializeAttribute()` method to support this decorator.
 *
 * Usage:
 * ```
 * class MyModel extends Model {
 *     \@unsendable \@attr('date') dateCreated!: Date;
 * }
 * ```
 */
export function alwaysSend(target: any, propertyKey: string) {
    if (!isArray(target.alwaysSentAttributes)) {
        target.alwaysSentAttributes = [];
    }

    if (target.alwaysSentAttributes.indexOf(propertyKey) === -1) {
        target.alwaysSentAttributes.push(propertyKey);
    }
}
