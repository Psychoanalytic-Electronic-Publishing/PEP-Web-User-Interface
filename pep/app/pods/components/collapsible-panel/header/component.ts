import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

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
}
