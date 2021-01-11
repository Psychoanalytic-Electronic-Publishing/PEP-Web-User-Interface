import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import ENV from 'pep/config/environment';
import PepSessionService from 'pep/services/pep-session';
import PrinterService from 'pep/services/printer';

interface DocumentActionsPrintArgs {
    id: string;
}

export default class DocumentActionsPrint extends Component<DocumentActionsPrintArgs> {
    @service('pep-session') session!: PepSessionService;
    @service printer!: PrinterService;

    /**
     * Print the document
     *
     * @memberof ReadDocument
     */
    @action
    print() {
        let url = `${ENV.apiBaseUrl}/${ENV.apiNamespace}/Documents/Downloads/PDF/${this.args.id}/?${this.session.downloadAuthParams}`;
        this.printer.printElement(url);
    }
}
