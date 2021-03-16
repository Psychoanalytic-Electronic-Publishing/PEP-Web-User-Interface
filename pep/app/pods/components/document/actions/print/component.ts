import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import ENV from 'pep/config/environment';
import PrinterService from 'pep/services/printer';
import PepSessionService from 'pep/services/session';

interface DocumentActionsPrintArgs {
    id: string;
}

export default class DocumentActionsPrint extends Component<DocumentActionsPrintArgs> {
    @service session!: PepSessionService;
    @service printer!: PrinterService;

    /**
     * Print the document
     *
     * @memberof DocumentActionsPrint
     */
    @action
    print() {
        const url = `${ENV.apiBaseUrl}/${ENV.apiNamespace}/Documents/Downloads/PDF/${this.args.id}/?${this.session.downloadAuthParams}`;
        this.printer.printElement(url);
    }
}
