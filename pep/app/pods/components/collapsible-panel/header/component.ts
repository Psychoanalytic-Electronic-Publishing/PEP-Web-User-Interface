import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import CurrentUserService from 'pep/services/current-user';
import FastbootMediaService from 'pep/services/fastboot-media';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface CollapsiblePanelHeaderArgs {
    title: string;
    secondaryAction?: {
        action: () => void;
        icon: string;
        label: string;
    };
}

export default class CollapsiblePanelHeader extends Component<BaseGlimmerSignature<CollapsiblePanelHeaderArgs>> {
    @service fastbootMedia!: FastbootMediaService;
    @service currentUser!: CurrentUserService;
}
