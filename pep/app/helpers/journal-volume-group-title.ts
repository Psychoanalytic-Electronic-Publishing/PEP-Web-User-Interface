import { helper } from '@ember/component/helper';

export function journalVolumeGroupTitle(params: [string] /*, hash*/) {
    return params[0] === 'TopLevel' ? null : params[0];
}

export default helper(journalVolumeGroupTitle);
