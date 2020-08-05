import { helper } from '@ember/component/helper';

/**
 * provides an easy way for creating an array of a specific length
 * most useful for a creating a basic `for` loop directly in a template,
 * e.g. {{#each (times 42) as |time index|}} {{index}} {{/each}}
 * Note: the 1st yielded block param `time` is always `undefined`
 *
 * @param {Array<string>} args
 */
function times(args: Array<string>) {
    const numTimes = parseInt(args[0], 10);
    return new Array(!isNaN(numTimes) && numTimes > 0 ? numTimes : 0);
}

export default helper(times);
