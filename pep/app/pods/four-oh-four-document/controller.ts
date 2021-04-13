import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import ModalService from '@gavant/ember-modals/services/modal';

export default class FourOhFourDocument extends Controller {
    @service modal!: ModalService;

    /**
     * Open report error modal
     *
     * @memberof FourOhFourDocument
     */
    @action
    reportError(): void {
        this.modal.open('help/report-data-error', {
            useCurrentURL: false
        });
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your controllers.
declare module '@ember/controller' {
    interface Registry {
        'four-oh-four-document': FourOhFourDocument;
    }
}
