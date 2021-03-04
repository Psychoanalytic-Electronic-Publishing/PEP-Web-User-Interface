import { helper } from '@ember/component/helper';

import moment from 'moment';

/**
 * Take in an embargo year amount and subtract that from the current year
 * in order to see what year documents are embargoed
 *
 * @export
 * @param {[string]} params
 * @return {*}  {string}
 */
export function embargoYear(params: [string]): string {
    return moment(new Date())
        .subtract(params[0], 'year')
        .format('YYYY');
}

export default helper(embargoYear);
