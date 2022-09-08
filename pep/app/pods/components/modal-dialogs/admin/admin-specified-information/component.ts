import { action } from '@ember/object';
import Component from '@glimmer/component';

import { Step } from 'ember-shepherd/services/tour';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsAdminAdminSpecifiedInformationArgs {
    onClose: () => void;
    options: {
        changeset: GenericChangeset<Step>;
        onSave: (changeset: Step) => void;
    };
}

export default class ModalDialogsAdminAdminSpecifiedInformation extends Component<
    BaseGlimmerSignature<ModalDialogsAdminAdminSpecifiedInformationArgs>
> {
    /**
     * Update the admin specified info
     *
     * @return {*}  {Promise<void>}
     * @memberof ModalDialogsAdminAdminSpecifiedInformation
     */
    @action
    async update(): Promise<void> {
        this.args.options.changeset.execute();
        await this.args.options.onSave(this.args.options.changeset?.data);
        this.args.onClose();
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'ModalDialogs::Admin::AdminSpecifiedInformation': typeof ModalDialogsAdminAdminSpecifiedInformation;
    }
}
