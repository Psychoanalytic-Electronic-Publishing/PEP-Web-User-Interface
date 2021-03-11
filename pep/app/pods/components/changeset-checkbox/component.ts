import Component from '@glimmer/component';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

interface ChangesetCheckboxArgs<T> {
    changeset: GenericChangeset<T>;
    path: keyof T;
    label: string;
}

export default class ChangesetCheckbox extends Component<ChangesetCheckboxArgs<unknown>> {}
