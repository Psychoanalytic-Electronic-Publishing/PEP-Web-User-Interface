import { action } from '@ember/object';
import Component from '@glimmer/component';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { Publisher } from 'pep/constants/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsAdminPublisherArgs {
    onClose: () => void;
    options: {
        changeset: GenericChangeset<Publisher>;
        onSave: (changeset: Publisher) => void;
    };
}

export default class ModalDialogsAdminPublisher extends Component<
    BaseGlimmerSignature<ModalDialogsAdminPublisherArgs>
> {
    /**
     * Update the Publisher changeset, call save and then close the modal
     *
     * @return {*}  {Promise<void>}
     * @memberof ModalDialogsAdminPublisher
     */
    @action
    async update(): Promise<void> {
        this.args.options.changeset.execute();
        await this.args.options.onSave(this.args.options.changeset?.data);
        this.args.onClose();
    }
}
