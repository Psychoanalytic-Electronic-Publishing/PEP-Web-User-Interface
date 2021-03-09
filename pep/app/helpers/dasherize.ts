import { helper } from '@ember/component/helper';
import { dasherize as emberDasherize } from '@ember/string';

export function dasherize(params: [string]): string {
    return emberDasherize(params[0]);
}

export default helper(dasherize);
