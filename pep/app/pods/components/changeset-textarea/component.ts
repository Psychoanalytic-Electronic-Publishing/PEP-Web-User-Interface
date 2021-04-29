import Component from '@glint/environment-ember-loose/glimmer-component';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface ChangesetTextareaArgs<T> {
    changeset: GenericChangeset<T>;
    path: keyof T;
}

export default class ChangesetTextarea extends Component<BaseGlimmerSignature<ChangesetTextareaArgs<unknown>>> {}
