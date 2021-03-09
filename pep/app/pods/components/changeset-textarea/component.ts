import Component from '@glimmer/component';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

interface ChangesetTextareaArgs<T> {
    changeset: GenericChangeset<T>;
    path: keyof T;
}

export default class ChangesetTextarea extends Component<ChangesetTextareaArgs<unknown>> {}
