import Component from '@glimmer/component';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface ChangesetTextareaArgs<T> {
    changeset: GenericChangeset<T>;
    path: keyof T;
}

export default class ChangesetTextarea extends Component<BaseGlimmerSignature<ChangesetTextareaArgs<unknown>>> {}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        ChangesetTextarea: typeof ChangesetTextarea;
    }
}
