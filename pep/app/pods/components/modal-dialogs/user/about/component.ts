import Component from '@glimmer/component';
import { ServerStatus } from 'pep/pods/application/controller';
import IntlService from 'ember-intl/services/intl';
import { inject as service } from '@ember/service';

interface ModalDialogsUserAboutArgs {
    onClose: () => void;
    options: {
        serverInformation: ServerStatus;
        clientBuildVersion: string;
    };
}

export default class ModalDialogsUserAbout extends Component<ModalDialogsUserAboutArgs> {
    @service intl!: IntlService;

    get isStatusOk() {
        return this.args.options.serverInformation.db_server_ok && this.args.options.serverInformation.text_server_ok;
    }

    get status() {
        if (this.isStatusOk) {
            return this.intl.t('about.status.ok');
        } else {
            return this.intl.t('about.status.down');
        }
    }
}
