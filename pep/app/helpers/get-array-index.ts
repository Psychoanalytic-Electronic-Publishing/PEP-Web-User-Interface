import { helper } from '@ember/component/helper';

export function getArrayIndex(params: [any[], number] /*, hash*/) {
    return params[0][params[1]];
}

export default helper(getArrayIndex);
