import { dasherize } from '@ember/string';

/**
 * Generates a cleaned up and dasherized string.
 * Note: This removes all non-word characters.
 *
 * @export
 * @param {string} str
 * @returns {string}
 */
export function cleanAndDasherize(str?: string) {
    return dasherize(str?.replace(/\W/g, '') ?? '');
}
