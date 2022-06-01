import Helper from '@ember/component/helper';

import { BufferedChangeset } from 'ember-changeset/types';

interface ChangesetSetSignature {
    PositionalArgs: [BufferedChangeset, keyof BufferedChangeset];
    Return: BufferedChangeset[keyof BufferedChangeset];
}

export default class ChangesetSet extends Helper<ChangesetSetSignature> {}
