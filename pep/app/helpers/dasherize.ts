import { helper } from '@ember/component/helper';
import { dasherize as emberDasherize } from '@ember/string';

/**
 * Dasherize a string using Ember's dasherize function
 *
 * @export
 * @param {[string]} params
 * @return {*}  {string}
 * @see https://api.emberjs.com/ember/release/classes/String/methods?anchor=dasherize
 */
export function dasherize(params: [string]): string {
    return emberDasherize(params[0]);
}

export default helper(dasherize);
