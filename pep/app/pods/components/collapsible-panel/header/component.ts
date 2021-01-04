import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import CurrentUserService from 'pep/services/current-user';
import FastbootMediaService from 'pep/services/fastboot-media';

interface CollapsiblePanelHeaderArgs {
    title: string;
    secondaryAction?: {
        action: () => void;
        icon: string;
        label: string;
    };
}

export default class CollapsiblePanelHeader extends Component<CollapsiblePanelHeaderArgs> {
    @service fastbootMedia!: FastbootMediaService;
    @service currentUser!: CurrentUserService;
}
