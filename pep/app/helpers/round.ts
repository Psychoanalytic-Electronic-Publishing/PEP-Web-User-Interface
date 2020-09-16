import { helper } from '@ember/component/helper';

/**
 * Rounds number using Math.round
 *
 * @export
 * @param {number[]} params
 * @returns {number}
 */
export function round(params: number[]) {
    return params[0] ? Math.round(params[0]) : undefined;
}

export default helper(round);
