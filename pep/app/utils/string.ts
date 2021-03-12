import { dasherize } from '@ember/string';

/**
 * Generates a cleaned up and dasherized
 * label for accessibility use.
 *
 * @export
 * @param {string} str
 * @returns {string}
 */
export function createAccessibilityName(str?: string) {
    return dasherize(str?.replace(/\W/g, '') ?? '');
}
