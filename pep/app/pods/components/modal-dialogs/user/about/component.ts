import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

import ThemeService from 'pep/services/theme';
import { ServerStatus } from 'pep/pods/components/page/nav/component';

interface ModalDialogsUserAboutArgs {
    onClose: () => void;
    options: {
        serverInformation: Promise<ServerStatus>;
        clientBuildVersion: string;
    };
}

export default class ModalDialogsUserAbout extends Component<ModalDialogsUserAboutArgs> {}
