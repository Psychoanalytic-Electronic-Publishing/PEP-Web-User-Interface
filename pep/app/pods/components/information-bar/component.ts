import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import ModalService from '@gavant/ember-modals/services/modal';

import InformationBarService from 'pep/services/information-bar';
import { slideDown } from 'pep/utils/animation';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface InformationBarArgs {}

export default class InformationBar extends Component<BaseGlimmerSignature<InformationBarArgs>> {
    @service declare informationBar: InformationBarService;
    @service declare modal: ModalService;
    transition = slideDown;

    /**
     * Hide information bar
     *
     * @memberof InformationBar
     */
    @action
    close() {
        this.informationBar.hide();
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        InformationBar: typeof InformationBar;
    }
}
