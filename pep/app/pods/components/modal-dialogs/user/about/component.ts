import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';
import IntlService from 'ember-intl/services/intl';

import { ServerStatus } from 'pep/api';
import PepSessionService from 'pep/services/pep-session';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface ModalDialogsUserAboutArgs {
    onClose: () => void;
    options: {
        serverInformation: ServerStatus;
        clientBuildVersion: string;
    };
}

export default class ModalDialogsUserAbout extends Component<BaseGlimmerSignature<ModalDialogsUserAboutArgs>> {
    @service intl!: IntlService;
    @service('pep-session') session!: PepSessionService;

    /**
     * @remarks
     * This method is part of the {@link ModalDialogsUserAbout}.
     *
     * @readonly
     * @memberof ModalDialogsUserAbout
     */
    get isStatusOk(): boolean {
        const serverInformation = this.args.options.serverInformation;
        return serverInformation.db_server_ok && serverInformation.text_server_ok;
    }

    get status(): string {
        return this.intl.t(this.isStatusOk ? 'about.status.ok' : 'about.status.down');
    }
}
