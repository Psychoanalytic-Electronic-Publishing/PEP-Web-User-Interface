import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import ScrollableService from 'pep/services/scrollable';
import { fadeTransition } from 'pep/utils/animation';
import { BaseGlimmerSignature } from 'pep/utils/types';

import { IconName } from '@fortawesome/fontawesome-svg-core';

interface AlertArgs {
    isShown: boolean;
    type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    message?: string;
    icon?: IconName;
    scrollableNamespace?: string;
    animateInitialInsert?: boolean;
}

export default class Alert extends Component<BaseGlimmerSignature<AlertArgs>> {
    @service scrollable!: ScrollableService;

    animateDuration = 300;
    animateTransition = fadeTransition;

    get animateInitialInsert() {
        return this.args.animateInitialInsert ?? true;
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        Alert: typeof Alert;
    }
}
