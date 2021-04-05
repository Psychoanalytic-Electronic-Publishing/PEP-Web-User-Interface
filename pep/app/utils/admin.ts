/**
 * Handles the array merging for the admin. We are using this because we always want the `sourceValue` to take precedence over the `objectValue`
 *
 * To provide an example, merge works from left to right. mergeWith({}, DEFAULTS, SAVEDOBJECT); This ensures that the saved object is always correct, even
 * if the save object has an empty array and the defaults provide elements in that same array
 * @export
 * @param {(object | any[])} objectValue
 * @param {(object | any[])} sourceValue
 * @return {*}
 */
export function mergingCustomizer(objectValue: object | any[], sourceValue: object | any[]) {
    if (Array.isArray(objectValue)) {
        return sourceValue;
    }
}
