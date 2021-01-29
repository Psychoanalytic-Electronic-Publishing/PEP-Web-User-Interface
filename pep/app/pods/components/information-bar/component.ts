import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import InformationBarService from 'pep/services/information-bar';
import { slideDown } from 'pep/utils/animation';

interface InformationBarArgs {}

export default class InformationBar extends Component<InformationBarArgs> {
    @service informationBar!: InformationBarService;
    transition = slideDown;

    @action
    close() {
        this.informationBar.hide();
    }
}
