import { action } from '@ember/object';
import Component from '@glimmer/component';

import { GenericChangeset } from '@gavant/ember-validations/utilities/create-changeset';

import { VideoConfiguration } from 'pep/constants/configuration';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsAdminVideoArgs {
    onClose: () => void;
    options: {
        changeset: GenericChangeset<VideoConfiguration>;
        onSave: (changeset: VideoConfiguration) => void;
    };
}

export default class ModalDialogsAdminVideo extends Component<BaseGlimmerSignature<ModalDialogsAdminVideoArgs>> {
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

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        'ModalDialogs::Admin::Video': typeof ModalDialogsAdminVideo;
    }
}
