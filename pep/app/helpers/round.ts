import { helper } from '@ember/component/helper';

/**
 * Rounds number using Math.round
 *
 * @export
 * @param {number[]} params
 * @returns {number}
 */
export function round(params: number[] /*, hash*/) {
    return Math.round(params[0]);
}

export default helper(round);
