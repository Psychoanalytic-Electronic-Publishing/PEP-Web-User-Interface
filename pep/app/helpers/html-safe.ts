import { helper } from '@ember/component/helper';
import { htmlSafe } from '@ember/template';
import { isNone } from '@ember/utils';

/**
 * Coerces any value given in the first param to a boolean value
 * @param {Array<string | null | undefined>} args
 */
function htmlSafeHelper(args: Array<string | null | undefined>) {
    return !isNone(args[0]) ? htmlSafe(args[0]) : args[0];
}

export default helper(htmlSafeHelper);
