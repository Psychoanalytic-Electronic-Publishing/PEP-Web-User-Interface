import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import ScrollableService from 'pep/services/scrollable';
import { fadeTransition } from 'pep/utils/animation';
import { BaseGlimmerSignature } from 'pep/utils/types';

interface AlertArgs {
    isShown: boolean;
    type: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
    message?: string;
    icon?: string;
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

    /**
     * Recalculates the alert's parent <Scrollable>'s scroll height on show/hide
     * if a scrollable namespace is provided
     */
    @action
    onIsShownUpdate() {
        if (this.args.scrollableNamespace) {
            later(() => this.scrollable.recalculate(this.args.scrollableNamespace), this.animateDuration);
        }
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        Alert: typeof Alert;
    }
}
