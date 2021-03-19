import { helper } from '@ember/component/helper';

import ENV from 'pep/config/environment';

/**
 * A helper to check if we are we currently using development
 *
 * @export
 * @param {(['development' | 'production'])} params
 * @return {*}  {boolean}
 */
export function isDevelopment(): boolean {
    return ENV.environment === 'development';
}

export default helper(isDevelopment);
