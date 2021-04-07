import { action } from '@ember/object';
import { later } from '@ember/runloop';
import { inject as service } from '@ember/service';

import Component from '@glint/environment-ember-loose/glimmer-component';

import CollapsiblePanelBody from 'pep/pods/components/collapsible-panel/body/component';
import CollapsiblePanelHeader from 'pep/pods/components/collapsible-panel/header/component';
import ScrollableService from 'pep/services/scrollable';
import { fadeTransition } from 'pep/utils/animation';
import { BaseGlimmerSignature } from 'pep/utils/types';

export interface CollapsiblePanelArgs {
    isOpen: boolean;
    scrollableNamespace?: string;
    toggle: (isOpen: boolean) => void;
}

interface CollapsiblePanelSignature extends Omit<BaseGlimmerSignature<CollapsiblePanelArgs>, 'Yields'> {
    Yields: {
        default: [{ header: typeof CollapsiblePanelHeader; body: typeof CollapsiblePanelBody }];
    };
}

export default class CollapsiblePanel extends Component<CollapsiblePanelSignature> {
    @service scrollable!: ScrollableService;

    animateDuration = 300;
    animateTransition = fadeTransition;

    /**
     * Toggles the collapsed/expanded state of the panel
     * @param {Event} event
     */
    @action
    toggle(event: Event) {
        event.preventDefault();
        this.args.toggle(!this.args.isOpen);
        if (this.args.scrollableNamespace) {
            later(() => this.scrollable.recalculate(this.args.scrollableNamespace), this.animateDuration);
        }
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        CollapsiblePanel: typeof CollapsiblePanel;
    }
}
