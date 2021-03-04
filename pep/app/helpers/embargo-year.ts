import { helper } from '@ember/component/helper';

import moment from 'moment';

export function embargoYear(params: [string]) {
    return moment(new Date())
        .subtract(params[0], 'year')
        .format('YYYY');
}

export default helper(embargoYear);
