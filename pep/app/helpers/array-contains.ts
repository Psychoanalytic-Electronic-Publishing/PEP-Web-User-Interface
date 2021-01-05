import { helper } from '@ember/component/helper';

export function arrayContains(params: [any[], any]) {
    return params[0].includes(params[1]);
}

export default helper(arrayContains);
