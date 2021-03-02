import { action } from '@ember/object';
import Component from '@glimmer/component';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { Publisher } from 'pep/constants/configuration';

interface ModalDialogsAdminExpertPickArgs {
    onClose: () => void;
    options: {
        changeset: GenericChangeset<Publisher>;
        onSave: (changeset: Publisher) => void;
    };
}

export default class ModalDialogsAdminExpertPick extends Component<ModalDialogsAdminExpertPickArgs> {
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
