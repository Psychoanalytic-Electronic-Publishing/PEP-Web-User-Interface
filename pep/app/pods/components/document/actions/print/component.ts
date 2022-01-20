import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import ENV from 'pep/config/environment';
import ConfigurationService from 'pep/services/configuration';
import PepSessionService from 'pep/services/pep-session';
import PrinterService from 'pep/services/printer';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface DocumentActionsPrintArgs {
    id: string;
    enabled: boolean;
}

export default class DocumentActionsPrint extends Component<BaseGlimmerSignature<DocumentActionsPrintArgs>> {
    @service('pep-session') declare session: PepSessionService;
    @service declare configuration: ConfigurationService;
    @service declare printer: PrinterService;

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
