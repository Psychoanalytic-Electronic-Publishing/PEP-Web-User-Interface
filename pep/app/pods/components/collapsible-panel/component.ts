import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

import { ComponentWithBoundArgs } from '@glint/environment-ember-loose';

import CollapsiblePanelBody from 'pep/pods/components/collapsible-panel/body/component';
import CollapsiblePanelHeader from 'pep/pods/components/collapsible-panel/header/component';
import ScrollableService from 'pep/services/scrollable';
import { fadeTransition } from 'pep/utils/animation';
import { BaseGlimmerSignature, ModifyBlocks } from 'pep/utils/types';

export interface CollapsiblePanelArgs {
    isOpen: boolean;
    scrollableNamespace?: string;
    toggle: (isOpen: boolean) => void;
}

interface CollapsiblePanelBlocks {
    Blocks: {
        default: [
            {
                header: ComponentWithBoundArgs<typeof CollapsiblePanelHeader, 'isOpen' | 'toggle'>;
                body: ComponentWithBoundArgs<typeof CollapsiblePanelBody, 'isOpen' | 'transition' | 'animateDuration'>;
            }
        ];
    };
}

export default class CollapsiblePanel extends Component<
    ModifyBlocks<BaseGlimmerSignature<CollapsiblePanelArgs>, CollapsiblePanelBlocks>
> {
    @service scrollable!: ScrollableService;

    animateDuration = 300;
    animateTransition = fadeTransition;

    /**
     * Toggles the collapsed/expanded state of the panel
     * @param {Event} event
     */
    @action
    toggle(event: Event): void {
        event.preventDefault();
        this.args.toggle(!this.args.isOpen);
    }
}

declare module '@glint/environment-ember-loose/registry' {
    export default interface Registry {
        CollapsiblePanel: typeof CollapsiblePanel;
    }
}
