import Helper from '@ember/component/helper';

import { BufferedChangeset } from 'ember-changeset/types';

interface ChangesetGetSignature {
    PositionalArgs: [BufferedChangeset, keyof BufferedChangeset];
    Return: BufferedChangeset[keyof BufferedChangeset];
}

export default class ChangesetGet extends Helper<ChangesetGetSignature> {}
