/**
 * Returns a number whose value is limited to the given range
 * @export
 * @param {number} num
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(num: number, min: number, max: number): number {
    return Math.max(Math.min(num, max), min);
}
