import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import InformationBarService from 'pep/services/information-bar';
import { slideDown } from 'pep/utils/animation';

interface InformationBarArgs {
    light: boolean;
}

export default class InformationBar extends Component<InformationBarArgs> {
    @service informationBar!: InformationBarService;
    transition = slideDown;

    /**
     * Returns whether or not the loading bar is visible
     *
     * @readonly
     * @type {boolean}
     */
    get isShown(): boolean {
        return this.informationBar.isShown;
    }

    /**
     * Returns whether or not the loading bar is light
     *
     * @readonly
     * @type {boolean}
     */
    get light(): boolean {
        return this.args.light ?? false;
    }

    @action
    close() {
        this.informationBar.hide();
    }
}
