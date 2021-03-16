import Component from '@glimmer/component';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

interface ChangesetRadioInputArgs<T> {
    changeset: GenericChangeset<T>;
    path: keyof T;
    label: string;
    value: any;
}

export default class ChangesetRadioInput extends Component<ChangesetRadioInputArgs<unknown>> {}
