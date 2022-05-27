import { action } from '@ember/object';
import Component from '@glimmer/component';

import { Step } from 'ember-shepherd/services/tour';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsAdminTourArgs {
    onClose: () => void;
    options: {
        changeset: GenericChangeset<Step>;
        onSave: (changeset: Step) => void;
    };
}

export default class ModalDialogsAdminTour extends Component<BaseGlimmerSignature<ModalDialogsAdminTourArgs>> {
    /**
     * Update the tour step
     *
     * @return {*}  {Promise<void>}
     * @memberof ModalDialogsAdminTour
     */
    @action
    async update(): Promise<void> {
        this.args.options.changeset.execute();
        await this.args.options.onSave(this.args.options.changeset?.data);
        this.args.onClose();
    }
}
