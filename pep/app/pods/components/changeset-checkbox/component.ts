import Component from '@glint/environment-ember-loose/glimmer-component';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface ChangesetCheckboxArgs<T> {
    changeset: GenericChangeset<T>;
    path: keyof T;
    label: string;
}

export default class ChangesetCheckbox extends Component<BaseGlimmerSignature<ChangesetCheckboxArgs<unknown>>> {}
