import { helper } from '@ember/component/helper';

/**
 * Coerces any value given in the first param to a boolean value
 * @param {Array<any>} args
 */
function bool(args: Array<any>) {
    return !!args[0];
}

export default helper(bool);
