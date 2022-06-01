import Component from '@glimmer/component';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface ChangesetCheckboxArgs<T> {
    changeset: GenericChangeset<T>;
    path: keyof T;
    label: string;
}

export default class ChangesetCheckbox extends Component<BaseGlimmerSignature<ChangesetCheckboxArgs<unknown>>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        ChangesetCheckbox: typeof ChangesetCheckbox;
    }
}
