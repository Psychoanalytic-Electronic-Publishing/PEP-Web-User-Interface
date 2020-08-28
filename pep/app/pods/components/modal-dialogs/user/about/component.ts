import Component from '@glimmer/component';
import { ServerStatus } from 'pep/pods/application/controller';

interface ModalDialogsUserAboutArgs {
    onClose: () => void;
    options: {
        serverInformation: Promise<ServerStatus>;
        clientBuildVersion: string;
    };
}

export default class ModalDialogsUserAbout extends Component<ModalDialogsUserAboutArgs> {}
